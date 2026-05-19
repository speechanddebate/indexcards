import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import z from 'zod';
import { UnlinkedStudentSearch } from '../../../openapi/schemas/Student.js';

describe('GET /rest/students/unlinked/search', () => {
  let userkey: string;
  let firstName: string;
  let lastName: string;

  beforeAll(async () => {
    const { chapterId } = await factories.chapter.createTestChapter();
    const { getStudent } = await factories.student.createTestUnlinkedStudent({ chapterId });
    const student = await getStudent() as { firstName: string; lastName: string };
    firstName = student.firstName;
    lastName = student.lastName;

    ({ userkey } = await factories.session.createTestSession({
      Person: {
        firstName,
        lastName,
      }
    }));
  });

  it('returns 401 without authentication', async () => {
    const res = await request(server)
      .get('/v1/rest/students/unlinked/search')
      .query({ first: firstName, last: lastName })
      .set('Accept', 'application/json')
      .expect(401);

    expect(res).toBeProblemResponse();
  });

  it('returns a list of matching unlinked students', async () => {
    const res = await request(server)
      .get('/v1/rest/students/unlinked/search')
      .query({ first: firstName, last: lastName })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userkey}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res).not.toBeProblemResponse();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body).toMatchSchema(z.array(UnlinkedStudentSearch));
  });

  it('returns an empty list when no students match', async () => {
    const res = await request(server)
      .get('/v1/rest/students/unlinked/search')
      .query({ first: 'ZZZNoMatch', last: 'ZZZNoMatch' })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userkey}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res).not.toBeProblemResponse();
    expect(res.body).toEqual([]);
  });

  it('uses users name to preform search with no params', async () => {
    const res = await request(server)
      .get('/v1/rest/students/unlinked/search')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userkey}`)
      .expect(200);

    expect(res).not.toBeProblemResponse();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body).toMatchSchema(z.array(UnlinkedStudentSearch));

  });
});

import { describe, it, beforeEach, expect, vi } from 'vitest';
import { createContext } from '/tests/httpMocks.js';
import * as controller from './categoryController.js';
import categoryRepo from '/api/repos/categoryRepo.js';

describe('Category Controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('getCategory', () => {
    it('should return the category if found and belongs to the tournament', async () => {
      const { req, res } = createContext({
        req: {
          params: { categoryId: 5, tournId: 10 },
        },
      });

      const mockCategory = { id: 5, name: 'Interp', tournId: 10 };
      vi.spyOn(categoryRepo, 'getCategory').mockResolvedValue(mockCategory);

      await controller.getCategory(req, res);

      expect(categoryRepo.getCategory).toHaveBeenCalledWith(5, { settings: true });
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    it('should return 404 if category is not found', async () => {
      const { req, res } = createContext({
        req: {
          params: { categoryId: 99, tournId: 10 },
        },
      });

      vi.spyOn(categoryRepo, 'getCategory').mockResolvedValue(undefined);

      await controller.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 if category does not belong to the tournament', async () => {
      const { req, res } = createContext({
        req: {
          params: { categoryId: 5, tournId: 10 },
        },
      });

      const mockCategory = { id: 5, name: 'Interp', tournId: 20 };
      vi.spyOn(categoryRepo, 'getCategory').mockResolvedValue(mockCategory);

      await controller.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getCategories', () => {
    it('should return a list of categories', async () => {
      const {req, res } = createContext({
        req: {
          params: { tournId: 1 },
        },
      });

      const mockCategories = [
        { id: 1, name: 'Cat1', tournId: 1 },
        { id: 2, name: 'Cat2', tournId: 1 },
      ];

      vi.spyOn(categoryRepo, 'getCategories')
        .mockResolvedValue(mockCategories);

      await controller.getCategories(req, res);

      expect(categoryRepo.getCategories).toHaveBeenCalledWith(
        expect.objectContaining({ tournId: 1 })
      );
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });
    it('should return a 400 error if tournament ID is not provided', async () => {
        const {req, res } = createContext({
            req: {
              params: { },
            },
        });

        await controller.getCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteCategory', () => {
    it('should delete the category if it exists and belongs to the tournament', async () => {
        const { req, res } = createContext({
            req: {
                params: { categoryId: 5, tournId: 10 },
            },
        });

        const mockCategory = { id: 5, tournId: 10 };
        vi.spyOn(categoryRepo, 'getCategory').mockResolvedValue(mockCategory);
        const deleteSpy = vi.spyOn(categoryRepo, 'deleteCategory').mockResolvedValue();

        await controller.deleteCategory(req, res);

        expect(categoryRepo.getCategory).toHaveBeenCalledWith(5);
        expect(deleteSpy).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 if tournId is missing', async () => {
        const { req, res } = createContext({
            req: {
                params: { categoryId: 5 },
            },
        });

        await controller.deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if categoryId is missing', async () => {
        const { req, res } = createContext({
            req: {
                params: { tournId: 10 },
            },
        });

        await controller.deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if category is not found', async () => {
        const { req, res } = createContext({
            req: {
                params: { categoryId: 99, tournId: 10 },
            },
        });

        vi.spyOn(categoryRepo, 'getCategory').mockResolvedValue(undefined);

        await controller.deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if category does not belong to the tournament', async () => {
        const { req, res } = createContext({
            req: {
                params: { categoryId: 5, tournId: 10 },
            },
        });

        const mockCategory = { id: 5, tournId: 20 };
        vi.spyOn(categoryRepo, 'getCategory').mockResolvedValue(mockCategory);

        await controller.deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

});

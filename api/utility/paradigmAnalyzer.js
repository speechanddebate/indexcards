// Invoke with e.g.: node api/utility/paradigmAnalyzer.js
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';

import config from '../../config/config.js';

// import db from '../helpers/litedb.js';

export const paradigmAnalyzer = async () => {
	const apiKey = process.env.GEMINI_API_KEY || config.GEMINI_API_KEY;
	const ai = new GoogleGenAI({ apiKey });

	// const paradigms = await db.sequelize.query(`
	// 	select person, value_text as 'paradigm'
	// 	from person_setting
	// 	where tag = 'paradigm'
	// 	and person IN (1, 3)
	// `, {
	// 	type : db.sequelize.QueryTypes.SELECT,
	// });

	const hardy = `<p>It's been a number of years since I've been an active coach or judge, so keep that in mind if your arguments rely on super deep background knowledge about the current year's topic. That said, I've judged many, many hundreds of debates in both college and high school, including the final rounds of most major college national tournaments; I'll work my hardest to keep up.</p><p>Meta Stuff</p><p>1) I think debates should be about the topic. This sentiment applies equally to affirmatives that don't want to discuss the topic and negatives that try to avoid clashing with the affirmative.</p><p>2) I am committed to the value of switch-side debating. I do not confuse my personal ideological beliefs with the educational value of an activity where we learn argumentation on complex issues.</p><p>3) I think that your choices about debate should reflect the value of hard work, not take shortcuts to avoid research, clash, or nuanced argument.</p><p>4) Technique matters more than the truth, but the closer your arguments hew to reality, the more likely they are to be persuasive.</p><p>5) Evaluation and comparison of your research materials is an intrinsic part of my judging. It&rsquo;s the only grounded and non-capricious way to adjudicate clash.</p><p>6) Offense/Defense &ndash; The debate is a math equation, and I try hard to solve it in a consistent fashion. Never underestimate the power of introducing 0 or infinity as a term in the equation &ndash; there&rsquo;s a universe of difference between 99 and 100%. It&rsquo;s to your benefit to guide my decision with explicit evaluation frameworks.</p><p>7) Alternate use time if debaters ask unanimously</p><p>8) Impact defense is underrated, especially against particularly silly impacts. I&rsquo;m also sympathetic to arguments related to relative impact evidence quality &ndash; a 6 word Mead card doesn&rsquo;t constitute an argument.</p><p>9) CP competition &ndash; As a general guideline, I think CP&rsquo;s shouldn&rsquo;t contain a world where the entire plan could happen. I don&rsquo;t think the affirmative is bound to defend either &ldquo;immediacy&rdquo; or &ldquo;certainty&rdquo; unless spoken to explicitly by the plan.</p><p>10) Reversion &ndash; If the 2NR extends a CP, I am willing to revert to the status quo if the CP isn&rsquo;t competitive or doesn&rsquo;t solve &ndash; but ONLY if the 2NR explicitly flags this as an option and explains why I should do so. And, the 2AR can obviously make arguments about why I shouldn&rsquo;t. It is not sufficient for the neg to only say &ldquo;the CP is conditional&rdquo; or &ldquo;SQ is a logical option&rdquo; earlier in the debate and expect me to do the reversion on my own. I have found that this would lead me to vote negative too often. Basically, I&rsquo;m willing to revert &ndash; but there&rsquo;s a high threshold for the 2NR to set it up.</p><p>11) In my experience, if the neg exits the block without harm-related defense to the aff, they usually lose.</p><p></p><p>Critiques</p><p>1) I prefer when they&rsquo;re not used as a shortcut to avoid topic-specific education. I don&rsquo;t think winning the affirmative is &ldquo;flawed&rdquo; means the neg wins &ndash; I think you need offense for why voting aff is bad in order for the critique to be a a reason to vote for you, and I think that offense needs to outweigh the aff.</p><p>2) In general, I am unpersuaded by the (usually analytic) argument that the existence of a net benefit for a CP means it must link to the aff&rsquo;s K.</p><p></p><p>Stupid arguments</p><p>I will listen to any argument you'd like to make, but there are a limited number of arguments which I think extensive community experience has proven over time to be particularly bad for both fairness and the educative value of the activity. As such, I am extremely unlikely to vote on them, and pursuing these lines of argumentation are likely to result in poor speaker points. 2AC's should feel free to dismiss these arguments with maximum flippancy. My current list includes:</p><p>1) Aspec and all derivatives</p><p>2) Consult CP's</p><p>3) Disclosure theory</p><p></p>`;
	const palmer = `<p>Tabroom.com is mostly my fault. I no longer coach, or judge much.</p><p>I prefer using the Tabroom docshare system (which I did not write as it happens) because it scrubs your personal data. I will not read along with your docs though and only consult them after. If I don't hear it I don't vote on it.</p><p>Don't attack people personally, through identity or otherwise. Debate the debate, not the debater.</p><p>Policy & LD:I'm OK with your speed but not topic specific jargon. Be slower for tags and author names. If you're losing me I'll say clear a couple times, but eventually will give up flowing and you won't like what happens next. I won't lean on the docs to catch up and have zero shame in saying "I didn't get it so I didn't vote for it." If I don't understand it until the 2N/2AR I consider it new. I also dislike debates about out of round conduct. I can't judge based on things I did not witness.</p><p>PF: I coached PF and don't sneer at it like a lot of coaches from the LD/Policyverse might. However, evidence shenanigans will cause your speaks to drop. Your evidence should be ready to share, ready to read, and real. Don't play the game of "Look How Circuit I Can Be Mr Policy/LD Judge!" when your opponent has zero idea of what's going on. Debate is engagement, and giving your opponent no chance to engage by design is a rather low way to vulture a win.</p>`;
	const theory = `<p>I have lots of preferences. Most of them are not important, like a general preference for DAs over CPs. I will however give slightly lower speaker points for running theory arguments.`;
	const leftwing = `<p>I have lots of preferences. Most of them are not important, like a general preference for DAs over CPs. However, anyone supporting Hegemony Good is a tool of imperialism and should be rejected. I will not vote for you if you are a tool of the oppressor.</p>`;
	const rightwing = `<p>I have lots of preferences. Most of them are not important, like a general preference for DAs over CPs. However, I do think that arguments about e.g. afropessimism are ruining debate and I won't vote for them.`;

	const paradigms = [
		{ person: 1, paradigm: palmer },
		{ person: 3, paradigm: hardy },
		{ person: 1000, paradigm: theory },
		{ person: 1001, paradigm: leftwing },
		{ person: 1002, paradigm: rightwing },
	];

	let prompt = `You are an expert at analyzing judging paradigms for competitive debate. `;
	prompt += `You will be given a paradigm written by a judge. `;
	prompt += `Analyze it for political bias or indications that the judge is unwilling or unable to evaluate arguments fairly. `;
	prompt += `Paradigms are meant to express preferences about style, specific argument types, or to be honest about individal biases. `;
	prompt += `Honestly relating those preferences is NOT evidence of bias. `;
	prompt += `Instead, we are primarily concerned with evidence of POLITICAL bias, bias for/against particular ideologies, or bias for/against particular identity categories. `;
	prompt += `Particular things to watch for include language suggesting the judge will `;
	prompt += `absolutely refuse to vote on certain kinds of arguments for ideological reasons, will favor arguments that `;
	prompt += `align with their political views, or will use speaker points as a punishment `;
	prompt += `or reward for particular political ideologies or identity categories. `;
	prompt += `For example, a judge saying they prefer not to vote for theory arguments is considered acceptable. `;
	prompt += `But, saying they refuse to vote for arguments which are not in agreement with a Marxist ideology would be evidence of bias. `;
	prompt += `Or, saying they will give low speaker points for judges who are unclear is acceptable, but suggesting they will give extra points to debaters of a particular race would be evidence of bias.`;
	prompt += `You will output a JSON object that contains a 'biased' flag. This should be .`;
	prompt += `true if you detect any bias or indications of non-neutrality, and false otherwise. `;
	prompt += `You will also output a 'biasScore' from 1 to 5, where 1 is completely neutral and not biased at all, 2 is slightly biased, 3 is moderately biased, 4 is very biased, and 5 is extremely biased. `;
	prompt += `Finally, if you detected bias, you will output a 'biasDetails' field that explains what you found and includes excerpts from the paradigm that demonstrate bias. `;

	console.log(`Starting paradigm analysis of ${paradigms.length} paradigms...\n`);

	const results = [];

	for (const p of paradigms) {
		console.log(`Analyzing paradigm for person ${p.person}...\n`);
		const response = await ai.models.generateContent({
			model: 'gemini-2.0-flash-lite',
			contents: `${prompt}\nHere's the paradigm to analyze:\n${p.paradigm}`,
			config: {
				responseMimeType: 'application/json',
				responseSchema: {
					type: Type.OBJECT,
					properties: {
						biased: { type: Type.BOOLEAN },
						biasScore: { type: Type.NUMBER, minimum: 1, maximum: 5 },
						biasDetails: { type: Type.STRING },
					},
					required: ['biased', 'biasScore'],
				},
			},
		});

		const result = JSON.parse(response.text);
		results.push({ ...result, person: p.person });
	}

	let csv = `person,biased,biasScore,biasDetails\n`;
	for (let i = 0; i < results.length; i++) {
		const biasDetails = results[i].biasDetails ? results[i].biasDetails.replace(/"/g, '""').replace(/\n/g, ' ') : '';
		csv += `${results[i].person},${results[i].biased ? 'true' : 'false'},${results[i].biasScore},"${biasDetails}"\n`;
	}

	const outputPath = path.join(process.cwd(), 'paradigm_analysis.csv');
	fs.writeFileSync(outputPath, csv, 'utf8');
	console.log(`\nDone. CSV file written to: ${outputPath}`);
};

await paradigmAnalyzer();
process.exit();

export default paradigmAnalyzer;

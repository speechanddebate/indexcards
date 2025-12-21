import { Router } from 'express';

const router = Router();

router.route('/login')
	.get((req,res) => {
		return res.status(200).json({message: 'hi'});
	});

export default router;
import express from 'express';
import Automation from '../Automation.js';
var router = express.Router();

const automation_map = new Map();

router.post('/start_instance', async function (req, res, next) {
	try {
		const { cookies, transaction_unique_id, deviceId } = req.body

		//first check the instance is already exist or not 
		let instance = null;
		if (automation_map.has(deviceId)) {
			instance = automation_map.get(deviceId);
			await instance.reloadPage();
		} else {
			instance = new Automation();
			await instance.init(cookies, transaction_unique_id, deviceId);
			await instance.open();
			automation_map.set(deviceId, instance);
		}

		const new_cookies = await instance.page.cookies();
		return res.status(200).json({
			status: 'success',
			cookies: new_cookies
		});

	} catch (error) {
		return res.status(400).json({
			message: error.user_message || "Something went wrong.",
			status: 'error',
			data: null
		})
	}
});

router.post('/check_transaction', async function (req, res, next) {
	try {
		const { cookies, transaction_unique_id, deviceId } = req.body

		//first check the instance is already exist or not 
		let instance = null;
		if (automation_map.has(deviceId)) {
			instance = automation_map.get(deviceId);
			await instance.reloadPage();
		} else {
			instance = new Automation();
			await instance.init(cookies, transaction_unique_id, deviceId);
			await instance.open();
			automation_map.set(deviceId, instance);
		}

		const data = await instance.getTransactionTableHtml();
		const new_cookies = await instance.page.cookies();
		return res.status(200).json({
			status: 'success',
			data: data,
			cookies: new_cookies
		});

	} catch (error) {
		return res.status(400).json({
			message: error.user_message || "Something went wrong.",
			status: 'error',
			data: null
		})
	}
});

router.get('/close_instances', async function (req, res, next) {
	try {
		//get all instances 

		for (const [key, value] of automation_map) {
			//check the last lastCheck and if there its not check for 30 min then close it 
			const lastCheck = new Date(value.lastCheck);
			const now = new Date();
			const diff = now - lastCheck;
			const diffMinutes = Math.floor(diff / 1000 / 60);
			if (diffMinutes > 30) {
				await value.closeBrowser();
				automation_map.delete(key);
			}
		}

		return res.status(200).json({
			status: 'success',
			message: "All instances closed successfully."
		});

	} catch (error) {
		return res.status(400).json({
			message: error.message,
			status: 'error',
			data: null
		})
	}
});

//reload this in every 10 min
router.post('/reload_update', async function (req, res, next) {
	try {
		const { cookies, transaction_unique_id, deviceId } = req.body;
		//first check the instance is already exist or not 
		let instance = null;
		if (automation_map.has(deviceId)) {
			instance = automation_map.get(deviceId);

		} else {
			instance = new Automation();
			await instance.init(cookies, transaction_unique_id, deviceId);
			await instance.open();
			automation_map.set(deviceId, instance);
		}

		await instance.reloadPage();
		const new_cookies = await instance.page.cookies();

		return res.status(200).json({
			status: 'success',
			cookies: new_cookies
		});

	} catch (error) {
		return res.status(400).json({
			message: error.message,
			status: 'error',
			data: null
		})
	}
});
export default router;

import puppeteer from 'puppeteer';
import UserError from './utils/UserError.js';
class Automation {
	constructor() {
		this.puppeteer = puppeteer;
		this.browser = null;
		this.page = null;
		this.cookies = null;
		this.transaction_unique_id = null;
		this.deviceId = null;
		this.lastCheck = new Date();
	}
	async init(cookies, transaction_unique_id, deviceId) {
		try {
			this.cookies = cookies;
			this.transaction_unique_id = transaction_unique_id;
			this.deviceId = deviceId;
		} catch (error) {
			new UserError(error.message || "Something went wrong.", error.user_message || "Something went wrong.", error.code)
		}
	}
	async sleep() {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	async open() {
		try {
			this.browser = await this.puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
			this.page = await this.browser.newPage();
			await this.page.setCookie(...this.cookies);
			await this.page.goto(`https://pay.google.com/g4b/u/4/transactions/${this.transaction_unique_id}`, { waitUntil: 'networkidle2' });
		} catch (error) {
			new UserError(error.message || "Something went wrong.", error.user_message || "Something went wrong.", error.code)
		}
	}
	async getTransactionTableHtml() {
		try {
			let details = null;
			const table = await this.page.$(`.CtOYUe`);
			if(table){
				details = await table.evaluate(el => el.innerHTML)
			}
			this.lastCheck = new Date();
			return details;
		} catch (error) {
			new UserError(error.message || "Something went wrong.", error.user_message || "Something went wrong.", error.code)
		}
	}
	async reloadPage() {
		try {
			await this.page.reload({ waitUntil: 'networkidle2' });
		} catch (error) {
			new UserError(error.message || "Something went wrong.", error.user_message || "Something went wrong.", error.code)
		}
	}
	async closeBrowser() {
		try {
			await this.browser.close();
		} catch (error) {
			new UserError(error.message || "Something went wrong.", error.user_message || "Something went wrong.", error.code)
		}
	}
}

export default Automation;
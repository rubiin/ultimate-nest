import puppeteer from 'puppeteer';

let instance = null;

export async function getBrowserInstance() {
	if (!instance) {
		instance = await puppeteer.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				'--single-process', // <- this one doesn't works in Windows
				'--disable-gpu',
			],
		});
	}

	return instance;
}

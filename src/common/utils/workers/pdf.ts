import { expose } from 'threads/worker';
import * as eta from 'eta';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { getBrowserInstance } from '@common/utils/puppteer.helper';

const logger: Logger = new Logger('CreatePdf');

const pdf = {
	async generatePdf(data: any): Promise<Buffer> {
		try {
			// We can use this to add dyamic data to our eta template at run time from database or API as per need.

			const html = await eta.renderFileAsync(
				`${process.cwd()}/assets/usage`,
				{ data },
				{ cache: true },
			);

			// we are using headless mode
			// this will reuse single browser

			const browser = await getBrowserInstance();

			const page = await browser.newPage();

			// We set the page content as the generated html by eta

			await page.setContent(html, {
				waitUntil: ['load', 'networkidle0'],
			});

			// this to determine the document width and height

			const [height, width] = await Promise.all([
				page.evaluate(() => document.documentElement.offsetHeight),
				page.evaluate(() => document.documentElement.offsetWidth),
			]);

			// we Use pdf function to generate the pdf as buffer

			const pdf = await page.pdf({
				printBackground: true,
				width: `${width + 1} px`,
				height: `${height + 1} px`,
			});

			await page.close();

			return pdf;
		} catch (e) {
			logger.error(e);
			throw new InternalServerErrorException('File cannot be generated');
		}
	},
};

export type Pdf = typeof pdf;

expose(pdf);

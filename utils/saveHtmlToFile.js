import * as fs from 'fs';
import * as path from 'path'

/**
 * Saves HTML content to a file on the server
 * @param {string} htmlContent - The HTML content to save
 * @param {string} uniqueId - A unique identifier for the file
 * @param {string} [directory='html_files'] - Directory to save the file (relative to project root)
 * @returns {Promise<string>} - Path to the saved file
 */
export const saveHtmlToFile = async (htmlContent, uniqueId, directory = 'html_files') => {
    try {
        // Create directory if it doesn't exist
        const dirPath = path.resolve(process.cwd(), directory);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Generate filename with timestamp to avoid collisions
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${uniqueId}_${timestamp}.html`;
        const filePath = path.join(dirPath, filename);

        // Write the HTML content to file
        await fs.promises.writeFile(filePath, htmlContent);

        console.log(`HTML file saved at: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error saving HTML file:', error);
        throw error;
    }
};
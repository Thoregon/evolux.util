/*
 * Copyright (c) 2023.
 */

export default class HTMLConverter {

    htmlToPlainText(htmlString) {
        let text = htmlString;
        text = text.replace(/<[^>]*>/g, "");
        return text;
    }
    htmlToFormattedText(htmlString, options = {}) {
        let text = htmlString;

        text = text.replace(/\n/gi, "");
        text = text.replace(/<style([\s\S]*?)<\/style>/gi, "");
        text = text.replace(/<script([\s\S]*?)<\/script>/gi, "");
        text = text.replace(/<a.*?href="(.*?)[\?\"].*?>(.*?)<\/a.*?>/gi, " $2 $1 ");
        text = text.replace(/<\/div>/gi, "\n\n");
        text = text.replace(/<\/li>/gi, "\n");
        text = text.replace(/<li.*?>/gi, "  *  ");
        text = text.replace(/<\/ul>/gi, "\n\n");
        text = text.replace(/<\/p>/gi, "\n\n");
        text = text.replace(/<\/h[1-9]>/gi, "\n\n");
        text = text.replace(/<br\s*[\/]?>/gi, "\n");
        text = text.replace(/<[^>]+>/gi, "");
        text = text.replace(/^\s*/gim, "");
        text = text.replace(/ ,/gi, ",");
        text = text.replace(/ +/gi, " ");
        text = text.replace(/\n+/gi, "\n\n");

        return text;
    }
    htmlToMarkdown() {} // : Converts HTML to Markdown.
    htmlToPDF() {}      // : Converts HTML to a PDF document.
    htmlToImage() {}    // : Converts HTML to an image file.
    htmlToXML() {}      // : Converts HTML to XML format.
    htmlToJSON() {}     // : Converts HTML to JSON format.

}
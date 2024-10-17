/*
 * Copyright (c) 2022.
 */

/*
 *
 * @author: Martin Neitz
 */

export default class ColorUtils {

    generateRandomColor() {
        var letters = "0123456789ABCDEF";
        var color   = "";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return `#${color}`;
    }

    getTextColor(bgColor, white = '#ffffff', black = '#000000' ) {
        const whiteContrast = this.getContrast( bgColor, white );
        const blackContrast = this.getContrast( bgColor, black );

        return whiteContrast > blackContrast ? white : black ;
    }

    getDarkModeColor(color) {
        // Convert HEX to HSL
        const hsl = this.hexToHsl(color);

        // If the lightness is too low (very dark colors), make it a bit lighter instead
        if (hsl.l < 10) {
            hsl.l = Math.min(20, hsl.l + 10); // Increase lightness for very dark colors
        } else {
            // Otherwise, darken the color for dark mode
            hsl.l = Math.max(0, hsl.l - 20);
        }
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }

    getRGB(c) {
        return parseInt(c, 16) || c;
    }

    getsRGB(c) {
        return this.getRGB(c) / 255 <= 0.03928
            ? this.getRGB(c) / 255 / 12.92
            : Math.pow((this.getRGB(c) / 255 + 0.055) / 1.055, 2.4);
    }

    getLuminance(hexColor) {
        return (
            0.2126 * this.getsRGB(hexColor.substr(1, 2)) +
            0.7152 * this.getsRGB(hexColor.substr(3, 2)) +
            0.0722 * this.getsRGB(hexColor.substr(-2))
        );
    }

    getContrast(f, b) {
        const L1 = this.getLuminance(f);
        const L2 = this.getLuminance(b);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    }

    blend(from, to, p = 0.5) {
        from = from.trim();
        to = to.trim();
        const r = Math.round;
        const b = p < 0;
        p = b ? p * -1 : p;
        const f = this.hexToRGBAValues(from);
        const t = this.hexToRGBAValues(to);
        if (to[0] === 'r') {
            return 'rgb' + (to[3] === 'a' ? 'a(' : '(') +
                r(((t[0] - f[0]) * p) + f[0]) + ',' +
                r(((t[1] - f[1]) * p) + f[1]) + ',' +
                r(((t[2] - f[2]) * p) + f[2]) + (
                    f[3] < 0 && t[3] < 0 ? '' : ',' + (
                        f[3] > -1 && t[3] > -1
                            ? r((((t[3] - f[3]) * p) + f[3]) * 10000) / 10000
                            : t[3] < 0 ? f[3] : t[3]
                    )
                ) + ')';
        }

        return '#' + (0x100000000 + ((
                f[3] > -1 && t[3] > -1
                    ? r((((t[3] - f[3]) * p) + f[3]) * 255)
                    : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255
            ) * 0x1000000) +
            (r(((t[0] - f[0]) * p) + f[0]) * 0x10000) +
            (r(((t[1] - f[1]) * p) + f[1]) * 0x100) +
            r(((t[2] - f[2]) * p) + f[2])
        ).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3);
    }

    hexToRGBAValues(d) {
        const l = d.length;
        const rgba = {};
        if (d.slice(0, 3).toLowerCase() === 'rgb') {
            d = d.replace(' ', '').split(',');
            rgba[0] = parseInt(d[0].slice(d[3].toLowerCase() === 'a' ? 5 : 4), 10);
            rgba[1] = parseInt(d[1], 10);
            rgba[2] = parseInt(d[2], 10);
            rgba[3] = d[3] ? parseFloat(d[3]) : -1;
        } else {
            if (l < 6) d = parseInt(String(d[1]) + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? String(d[4]) + d[4] : ''), 16);
            else d = parseInt(d.slice(1), 16);
            rgba[0] = (d >> 16) & 255;
            rgba[1] = (d >> 8) & 255;
            rgba[2] = d & 255;
            rgba[3] = l === 9 || l === 5 ? r((((d >> 24) & 255) / 255) * 10000) / 10000 : -1;
        }
        return rgba;
    }

    hexToRGBA(hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
        }
        throw new Error('Bad Hex');
    }

    // Convert HEX to HSL
    hexToHsl(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    // Convert HSL back to HEX
    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c/2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }

    roll() {
        const bgColor = generateRandomColor();

        const button = document.querySelector("button");

        const textColor = getTextColor(bgColor);


        document.body.style.backgroundColor = bgColor;
        button.style.backgroundColor        = textColor;
        button.style.color                  = bgColor;
        document.body.style.color           = textColor;
    }

    lightOrDark( color ) {

        let element, bgColor, brightness, r, g, b, hsp;

        // Check the format of the color, HEX or RGB?
        if (color.match(/^rgb/)) {

            // If HEX --> store the red, green, blue values in separate variables
            color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

            r = color[1];
            g = color[2];
            b = color[3];
        }
        else {

            // If RGB --> Convert it to HEX: http://gist.github.com/983661
            color = +("0x" + color.slice(1).replace(
                    color.length < 5 && /./g, '$&$&'
                )
            );

            r = color >> 16;
            g = color >> 8 & 255;
            b = color & 255;
        }

        // HSP equation from http://alienryderflex.com/hsp.html
        hsp = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        );

        // Using the HSP value, determine whether the color is light or dark
        if (hsp>127.5) {

            return 'light';
        }
        else {

            return 'dark';
        }
    }

}
 
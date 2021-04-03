/**
 * simple ini parser
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

/*
 * define the possible values:
 * section: [section]
 * param: key=value
 * comment: ;this is a comment
 */

let regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
    value: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/
};

export default (data) => {
    let value = {};
    let lines = data.split(/\r\n|\r|\n/);
    let section = null;
    lines.forEach(function(line){
        if(regex.comment.test(line)){
            return;
        }else if(regex.param.test(line)){
            let match = line.match(regex.param);
            if(section){
                value[section][match[1]] = match[2];
            }else{
                value[match[1]] = match[2];
            }
        }else if(regex.section.test(line)){
            let match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
        }else if(line.length == 0 && section){
            section = null;
/*
        } else if (line.length > 0) {
            if(section){
                if (!value[section]) value[section] = [];
                value[section].push(line);
            }else{
                // value[match[1]] = match[2];
            }
*/
        };
    });
    return value;
}

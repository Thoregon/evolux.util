

export default class MediaService {

    constructor() {
        this._url = undefined;
    }

    static withURL( url ) {
        for ( const service of SERVICES ) {
            if ( service.canHandle( url ) ) {
                return service.initializeWithURL( url );
            }
        }
    }

    static canHandle( url ) {
        return this.reg().test(url);
    }

    static initializeWithURL( url ) {
        let ms = new this;
        ms.url = url;
        return ms;
    }

    static reg()   {}

    get url()      { return this._url; }
    set url( url ) { this._url = url; }


    getMediaID() {
        return this.parseURLForLastElement();
    }

    /**
     * Find teh last element in the url, without any trailing parameters
     *
     */

    parseURLForLastElement() {

        const urlParts = this.url.split('/');

        let prospect   = urlParts.pop();
        let prospectWithParameter = prospect.split( /(\?|\=|\&)/ );

        return  ( prospectWithParameter.length === 0 )
                ? prospect
                : prospectWithParameter[0];
    }

    getEmbedURL(){}
    getEmbedCode() {}

}

export class MediaServiceVimeo extends MediaService {

    static reg() {  return /vimeo/; }

    getEmbedCode() {
        let mid  = this.getMediaID();
        return '<iframe  id="aurora_video_' + mid + '" src="' + this.getEmbedURL() + '" width="243" height="360" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen scrolling="no"></iframe>';
    }

    getEmbedURL(){
        const autoplay =  ( this.autoplay )
                          ? "true"
                          : "false";


        const securityParm = ( this.getSecureID() )
                             ? '&h=' + this.getSecureID()
                             : '';

        return 'https://player.vimeo.com/video/' + this.getMediaID() + '?title=1' + securityParm + '&byline=1&amp;portrait=1&amp;autoplay=' + autoplay;
    }


    getMediaID() {
        let mid = this.url.split( /(https?:\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/ );
        return mid[5];
    }

    getSecureID() {
        const sid = this.parseURLForLastElement();
        return ( sid == this.getMediaID() )
               ? false
               : sid;
    }
}

export class MediaServiceYoutube extends MediaService {
    reg() { return /youtube|youtu\.be/; }
}


const SERVICES = [
    MediaServiceVimeo,
    MediaServiceYoutube
];

import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import App from '/app.js'

class UserMessage extends LitElement{

    static get styles() {
        return css`
            .self{
                background-image: linear-gradient(122deg, rgb(106 246 136 / 40%), rgb(12 106 248 / 32%))
            }
            .bot{
                background-image: linear-gradient(122deg, rgb(106 160 246 / 59%), rgb(248 12 156 / 32%));
            }
            .others{
                background-image: linear-gradient(122deg, rgb(255 215 67 / 66%), rgb(0 196 255 / 30%))
            }
            .message{
                margin-top:10px;
                display:flex;
            }
                .image{
                    flex-shring:0;
                    margin-left:10px;
                    width:40px;
                    height:40px;
                    border-radius:50%;
                    box-shadow:  rgb(190 190 190) 3px 3px 7px 0px, rgb(255 255 255) -3px -4px 11px 0px;
                }
                .info{
                    flex-grow:2;
                    margin-right:18px;
                    margin-left:10px;
                    border-radius:10px;
                    padding:5px;
                }
                .message-header{
                    display:flex;
                    justify-content:space-between;
                }
                .date{
                    margin-right:5px;
                    color:gray;
                }
                .text{
                    width:200px;
                    white-space:pre-wrap;
                    overflow-wrap: break-word;
                }
        `;
    }
            // .image{
            //     /* background-image:url(${this.props.userDetails.image}) */
            // }
    render(){       
        return html`
        <style>

        </style>
            <div class="message">
                <div class="image" style="background-image:${this.image}"></div>
                <div class="info ${this.style}">
                    <div class="message-header">
                        <div class="name">${this.props.userName}</div>
                        <div class="date">${this.props.date}</div>
                    </div>
                    <div class="text">${this.props.text}</div>
                </div>
                
            </div>
        `
    };
    //@@ prop initialisation should happpen here?
    firstUpdated(){

        //images are hardcoded for temporary use, images will come through message props
        switch(this.props.userName){
            case App.userName:{
                this.style = "self"
                this.image = "linear-gradient(135deg, rgba(0,0,0,0.22), rgba(255,255,255,0.25))"
                break
            }
            case "ChatBot":{
                this.style = "bot"
                this.image = "linear-gradient(135deg, rgba(0,0,0,0.22), rgba(255,255,255,0.25))"
                break;
            }
            default:{
                this.image = "linear-gradient(135deg, rgba(0,0,0,0.22), rgba(255,255,255,0.25))"
                this.style = "others"
                break;
            }
        }
    }

    //@@ should I declare props for only inside component use
    static get properties() {
        return { 
          props: {
              type: Object
          },
          style: { type: String},
          image: {type:String}
        };
    }

    // static get observedAttributes() {
    //     return ["someAttribute"];
    // }

    // attributeChangedCallback(name, oldValue, newValue) {
    //     if (oldValue === newValue) {
    //         return;
    //     }    
    //     console.log(`The attribute ${name} has changed`);
    // }
}
window.customElements.define('user-message', UserMessage);
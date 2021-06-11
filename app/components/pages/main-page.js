import { LitElement, html, css} from "https://unpkg.com/lit-element/lit-element.js?module"
import "/components/room-card.js"
import App from "/app.js"

class MainPage extends LitElement{
    static get styles() {
        return css`
            #room-section, #user-section{
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                width: 100%;
            }

            #user-info{
                display:flex;
                flex-direction:column;
                align-items:center;
            }
                #user-image{
                    margin-top: 100px;
                    height: 170px;
                    width: 170px;
                    border-radius: 50%;
                    background-color:rgb(189, 236, 189);
                    background-size: cover;
                    background-position: center;
                    box-shadow: 1px 1px 7px 0px rgb(0 0 0 / 30%)
                }
                #user-input{
                    margin-top: 40px;
                    border: none;
                    outline: none;
                    box-shadow: 1px 1px 5px rgba(0,0,0,0.2);
                    border-radius:50px;
                    font-size: 1.5em;
                    padding: 10px 15px;

                    transition: all 0.3s ease-out;
                }
                #user-input::placeholder{
                    color: rgba(0,0,0,0.3);
                }
                a{
                    text-decoration: none;
                }
                .light{
                    transform:scale(1.08);
                    box-shadow: 3px 3px 10px rgba(0,0,0,0.2) !important;
                }
        `
    }
    
    render(){       
        return html`
            <div id="user-section">
                <div id="leaderboard">
                    
                </div>
                <div id="user-info">
                    <div id="user-image" style='background-image:url("/Assets/Snakes/snake1.jpg")'></div>
                    <input id="user-input" class="${this.animating?"light":""}" type="text" placeholder="Enter your name" value="${App.userName?App.userName:""}" required> <!--@@-->
                </div>
                <div id="stats">

                </div>
            </div>
            <div id="room-section">
                <room-card>Time Mode</room-card>
                <room-card>Hit Mode</room-card>
                <room-card>Eat Mode</room-card>
            </div>
        `
    }
    static get properties() {
        return { 
          animating: { type: Boolean }
        };
    }

    firstUpdated() {
        this.animating = false;
        this.userInput = this.shadowRoot.getElementById('user-input');

        this.userInput.addEventListener('input',(event)=>{
            App.userName = event.target.value;
            //debounce and check if user name is available in users collection
            //if yes show "OK"-create user icon to create new account
            //esle show login icon
        }) 

        this.addEventListener('no-name',()=>{
            this.animating = !this.animating;
        })

        //creating account
        /* 
            on OK, post {userName, pin}, and insert it to database users collection
            and => login
            else please login or create account
        */
    }

}
window.customElements.define('main-page', MainPage);




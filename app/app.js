export default class App{
    //@@ why should I make getters instead of just declaring them as static fields?
    //doesnot event work, says stack size exceeded
    // static set socket(data){
    //     this.socket = data;
    // }
    // static get socket(){
    //     return this.socket;
    // }

    //static socket;

    // static appRoot;
    // static user;
    // static room;
    // static loginStatus = true;

    static get routes(){
        return [
            { path:"/", page: "main-page"},
            { path:"/chat", page: "chat-page" },
            { path:"/leaderboard", page: "leaderboard-page"}
        ]
    }
    static updateRoute = ()=>{
        let matchingPage;
        this.routes.forEach((pageRoute)=>{
            if(pageRoute.path === location.pathname){
                matchingPage = pageRoute;
            }
        })
        if(!matchingPage){
            matchingPage = routes[0];
            history.pushState(null,null,"/");
        }

        this.loadPage(matchingPage.page);
    } 

    static navigateTo = (url)=>{
        history.pushState(null,null,url);
        this.updateRoute();
    }

    static loadPage(page){
        let pageComponent = document.createElement(page)
        this.appRoot.appendChild(pageComponent);

        if(this.appRoot.childElementCount > 1){
            //set slideOff effect to first child
            //slide in effect to last child
        }
        setTimeout(() => {
            if(this.appRoot.childElementCount > 1)
            this.appRoot.firstElementChild.remove()
        }, 0); //set time out for animation
    }
}
//----------------------------------------------------------------------
import '/components/pages/chat-page.js'
import '/components/pages/main-page.js'

App.socket = io();
App.appRoot = document.getElementById('app-root');


//go back load correct page
//if popback happens from chat page , it should log out chat room
window.addEventListener('popstate', ()=>{
    App.socket.emit('leave')
    App.updateRoute();
});
//on connect load correct page 
document.addEventListener('DOMContentLoaded',()=>{
    App.updateRoute();
})




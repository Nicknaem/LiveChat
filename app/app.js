export default class App{

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
            //set slideOff effect to first page
            //slide in effect to last page
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


window.addEventListener('popstate', ()=>{
    App.socket.emit('leave')
    App.updateRoute();
});

document.addEventListener('DOMContentLoaded',()=>{
    App.updateRoute();
})




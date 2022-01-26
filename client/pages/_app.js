/* 
    This file _app.js is used by the next.js to and it wrap the components listed in the page through this 
    _app.js file, and we are overloading this file to apply the global css, since if you add the style.css to the 
    index.js it will not get reflected to the other routes,
    So in order to create a global CSS file , we can add the css here.

*/

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

//Here the component is the current component viewing in the page such as /auth/sigin and pageProps are passed down as props to the component

const AppComponent = ({Component, pageProps, currentUser}) => {
    
    return (<div>
        <Header currentUser={currentUser} />
        <div className='container'>
            <Component {...pageProps} currentUser={currentUser} />
        </div>
    </div>);
}
/* 
 We are doing this cause we want to show header sigin button and signout button based on the currentUser status loggedIn or Not.
    Disclaimer: If the getInitialProps is used here then, in index file i.e. pages, next.js don't allow to define the getinitalprops
*/
AppComponent.getInitialProps = async (appContext)=>{

    const client = buildClient(appContext.ctx); //the request context is located inside the ctx in app component.
   const { data } = await client.get('/api/users/currentuser');

   //we are trying to call also the getintialprops for the pages, which were blocked by the AppComponent initialpage
   let pageProps = {};
   if(appContext.Component.getInitialProps){
       //here we are passing the client and the current user to each and every get initial props function of the components
       //so that they can use it without have to build client and currentUser each time from their getInitialProps
       pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
   }

   return {
       pageProps, //this is already passed down to the components,
       currentUser: data.currentUser
   }
}

export default AppComponent;

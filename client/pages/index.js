// import buildClient from "../api/build-client";

import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
    console.log('TICKETS',tickets)
    const ticketList = tickets.map((ticket)=>{
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                {/* This link has href and as tag both for the use of the wild card like the ticketID,
                    we have to provide the href to the directory and then used it as tag the original
                    link
                */}
                <td>
                    <Link href="/tickets/[ticketid]" as={`/tickets/${ticket.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        )
    });

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )

};

//this is like the componentDidMount function where we call the request at the time of the component
//this is used to check if the current user is logged in or not, based on that we will preview component signIn or logout
//getInitialProps receive the request same as the express request;
LandingPage.getInitialProps = async (requestContext, client, currentUser) => {
    /* 
        We have to check here when the page is refreshed and came from other link and directly tying the url
        then the getInitialProps in the Nextjs called from the server side so, axios are calling the
        localhost:80/api/user/current user inisde the port (which we don't want ), we want to call it to the
        ingress-service which will handle the domain routing, but to call it first have to identify where is called server 
        or client

        *If called in server we have mechanism to call to the ingeress by getting namespace and service name
        * Namespace is maintained by kubernetes which run objects in different namespace, so to get namespace use command `kubectl get namespace`
        * Then get the ingress service name to call it using `kubectl get services -n <namespace>ingress-nginx`
        * Then URL would become http://SERVICENAME.NAMESPACENAME.svc.cluster.local/api/users/currentuser
    */

        // const client =  buildClient(requestContext);
        // const {data} = await client.get('/api/users/currentuser');
        // return data;

        //Fetch the list of the tickets using the client we passed here
        const { data } = await client.get('/api/tickets');

        return { tickets: data }
}

export default LandingPage;
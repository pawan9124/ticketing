import useRequest from "../../hooks/use-request";
import Router from 'next/router';

const TicketShow = ({ ticket })=>{

    const {doRequest, errors}  = useRequest({
        url: '/api/orders',
        method: 'post',
        body:{
            ticketId: ticket.id
        },
        onSuccess: (order)=> Router.push('/orders/[orderId]',`/orders/${order.id}`)
    });
    return (
        <div>
            <h2>{ticket.title}</h2>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button onClick={()=> doRequest()} className="btn btn-primary">Purchase</button>
        </div>
    )
};

/* 
    THis getInitialProps function is used to fetch the data like componentDidMount on the time of render
*/

TicketShow.getInitialProps = async (context, client)=>{
    const { ticketId } = context.query;;
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    //this return will provide the data to the component as props
    return {ticket:data};
}

export default TicketShow;
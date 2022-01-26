import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser })=>{
    const [ timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors }  = useRequest({
        url:'/api/payments',
        method: 'post',
        body:{
            orderId: order.id
        },
        onSuccess: ()=> Router.push('/orders')
    });

    useEffect(()=>{
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        }
        //Call the first time make sure it appears on the page 
        findTimeLeft();
        //then set on the interval at some regular time of one seconds
        const timerId = setInterval(findTimeLeft, 1000);

        //clear on unmount
        return ()=>{
            clearInterval(timerId);
        }

    }, []);

    if(timeLeft < 0){
        return <div>Order Expired</div>
    }

    return(
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout 
                token={({ id })=> doRequest({token:id}) }
                stripeKey="pk_test_51HxeDPCFRg2ffIwMZSlrnGVUww5BhkvT4Y9mknBi45BqugZySPdBLX557tKk6wpbpS2TBFDgjLd9CmI4mX0AmhMk00GlGDiKY3"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    )
}

OrderShow.getInitialProps = async (context, client)=>{
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order:data };
}

export default OrderShow;
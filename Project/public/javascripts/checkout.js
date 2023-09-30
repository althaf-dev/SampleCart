

$("#checkout-form").submit((e)=>{


    e.preventDefault();
    console.log("checked");
    $.ajax({

        url:"/checkout",
        type:"post",
        data:$("#checkout-form").serialize(),

    }).done((response)=>{

        if(response.codsucess){
            location.href="/message";
        }
        else{
            payRazor(response);
        }
        
    })
})


function payRazor(order){

    var options = {
        "key": "rzp_test_XouelohZrCiuGK", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR", 
        "name": "Acme Corp", //your business name
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        
        "handler":function (response){

            verifyPayment(response,order);
        },
        "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
        "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
            "name": "Gaurav Kumar", //your customer's name
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment,order){


$.ajax({

    url:'/verify-pay',
    data:{payment,order},
    type:'POST'
}).done((response)=>{

    console.log(response);         
    if (response.status){

        alert("payment success");
        location.href="/message";

    }
    else{
        alert("Payment failed");
    }

    
})

}
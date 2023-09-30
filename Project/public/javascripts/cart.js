
function addToCart(id){

    console.log("ajax");

    $.ajax({

        url:"/add-to-cart/"+id,
    }).done((response)=>{

       if(response.status){



        let count = Number($("#items").html()); 
        count++;
        console.log(count);
        $("#items").html(count);

       }
    })

}

function incQty(event,id,operation){

    console.log(operation);

    const qty = event.target.parentElement.children[1];
    const minusButton = event.target.parentElement.children[0];
    console.log(qty);
    $.ajax({

        url:"/add-to-cart/"+id,
        type:"POST",
        data:{operation}
    }).done((response)=>{

       if(response.status){
        console.log(response.Total);
        $("#total").html(response.Total)
        let quantity = Number($(qty).html()); 
        quantity += Number(operation);
        if(quantity<2){
            $(minusButton).hide();
        }
        else{
            $(minusButton).show();
        }
        
        console.log(quantity);
        $(qty).html(quantity);

      console.log("done");

       }
    })

}

function removeItem(id,event){

    const parentRow = event.target.parentElement.parentElement;
    
    console.log("item remove command");
    $.ajax({

        url:"/delete-cart-item/"+id,
        type:"POST"
    }).done(()=>{

      
        $(parentRow).html("Item Removed");
        $(parentRow).css("text-align","center");
        $(parentRow).css("color","red")
        alert("Item removed");
        location.reload();


    })
}


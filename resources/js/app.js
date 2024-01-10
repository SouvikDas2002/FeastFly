// const initAdmin=require('./admin')

let addToCart = document.getElementsByClassName('add-to-cart');

let cartCounter=document.getElementById("cartCounter");

const updateCart=async (item)=>{
    // console.log(cartItem);
    const cartItem=await axios.post('/update-cart',item)
    cartCounter.innerText=cartItem.data.totalQty;
    Toastify({
        text: `${cartItem.data.totalQty} added to your cart`,
        duration:2000,
        className: "info",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
    
}

for (let i = 0; i < addToCart.length; i++) {
    addToCart[i].onclick = () => {
        const itemData=JSON.parse(addToCart[i].dataset.items);
        updateCart(itemData)
        // console.log(itemData);
    };
}

// remove alert message after x seconds

const alertMsg=document.getElementById('success-alert')

if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove()
    },2000)
}

// change order status

let order=document.getElementById('hiddenInput') ? document.getElementById('hiddenInput').value :null
order=JSON.parse(order)
console.log(order);

let status=document.getElementsByClassName('status_line')
function updateStatus(order){
    // console.log(status);
    let stepCompleted=true;
    Array.from(status).forEach(x => {
        let dataprop=x.dataset.status
        console.log(dataprop);
        if(stepCompleted){
            x.classList.add('step-completed')
        }
        if(dataprop===order.status){
            stepCompleted=false
            if(x.nextElementSibling){
                x.nextElementSibling.classList.add('current')
            }
        }
    });
}
updateStatus(order);
var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL,
		pass: process.env.GMAILPASS
	}
});


const SendEmailToKaientai = (dataMain) => {
  const mailOptionsToTeam = {
    from: process.env.GMAIL,
    to: 'uhakdt@gmail.com, mierdluffy@gmail.com',
    subject: 'App New Order! 🥸',
    text: 
    `
    Order Details:
    Order ID: ${dataMain.orderID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    Name: ${dataMain.name}
    Email: ${dataMain.email}
    Phone Number: ${dataMain.phone}
    Address1: ${dataMain.address1}
    Postcode: ${dataMain.postcode}
    City: ${dataMain.city}

    Delivery Instructions: ${dataMain.deliveryInstructions}
    `
  };
  transporter.sendMail(mailOptionsToTeam, function(error, info) {
    if(error){
      console.log(error);
    } else {
      console.log('Email has been sent to Team!');
    }
  });
}

const SendEmailToCustomer = (dataMain) => {
  const mailOptionsToSupplier = {
    from: process.env.GMAIL,
    to: `${dataMain.email}`,
    subject: 'Order Confirmation from the Kaientai App',
    text: 
    `
    Hi ${dataMain.name},
    
    You have made an order on our Kaientai. The order will be fulfiled and delivered to you as soon as posssible. Below are the order details:

    Order Details:
    OrderID: ${dataMain.orderID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    
    Shipping Details:
    First line of address: ${dataMain.address1}
    City: ${dataMain.city}
    Postcode: ${dataMain.postcode}

    If these shipping details are incorrect, please either email us on bauan@kaientai.co.uk or give us a call on: 07830514629

    Thank you!!
    
    Kindest Regards,

    Mier at Kaientai
    `
  };
  
  transporter.sendMail(mailOptionsToSupplier, function(error, info) {
    if(error){
      console.log(error);
    } else {
      console.log(`Email has been sent to ${dataMain.name}!`);
    }
  });

}

exports.SendEmailToKaientai = SendEmailToKaientai;
exports.SendEmailToCustomer = SendEmailToCustomer;

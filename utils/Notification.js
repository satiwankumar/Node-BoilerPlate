
const Notification =  require('../models/notifications.model')
const FCM = require('fcm-node')
const config = require('config')
const serverKey = 'xxxxxx' //put the generated private key path here    

module.exports = {
    
CreateNotification : async(data)=>{
    try {
    const {notifiableId,notificationType,title,body} = data

    
         const notification  = new Notification({
            notifiableId:notifiableId,
            notificationType:notificationType,
            title:title,
            body:body

        })

        await notification.save()
    }catch (error) {
        console.log(error)
    }

},
SendPushNotification: async(noti)=>{
    const {notifiableId,notificationType,title,body,payload} = noti
        
  

         const notification  = new Notification({
            notifiableId:notifiableId,
            notificationType:notificationType,
            title:title,
            body:body

        })

        await notification.save()
    
    var fcm = new FCM(serverKey)
 
    const deviceTokens = []
    const   sessions = await Session.find({user:notifiableId})
   
    sessions.forEach(element => {
        // console.log(sessions.deviceId)
        if(element.deviceId != null){
        deviceTokens.push(element.deviceId)
    }
    
    });
    // console.log(deviceTokens)
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        registration_ids: deviceTokens, 
        collapse_key: 'your_collapse_key',
        
        notification: {
            title: title, 
            body: body 
        },
        
        data:payload
    }
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log(err)
            console.log("Something has gone wrong!")
        return response

        } else {
            console.log("Successfully sent with response: ", response)
            return  response
        }
    })

      

}

}
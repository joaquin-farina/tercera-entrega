class MessageController {
    getMessage = async (req, res) => {
        const user = req.user.email
        console.log('chat', user);
        
        res.render("chat",{
            user
        });
    }
}

export default MessageController
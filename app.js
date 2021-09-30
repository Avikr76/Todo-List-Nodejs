const express = require('express');
const date = require(__dirname +"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
// let items = [];
// let workItems = [];

mongoose.connect("mongodb+srv://admin-abhinav:Todolist100@cluster0.hy6cx.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Web Dev"});
const item2 = new Item({ name: "Ruby"});
const item3 = new Item({ name: "Blog"});

const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/', function(req, res) {

    Item.find({}, function(err, foundItems) {
        if(foundItems.length === 0)
        {
            Item.insertMany(defaultItems, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Successfully inserted default items to database");
            }

            });
            res.redirect("/");
        } else {
            res.render('list', {listTitle: "Today", newListItems: foundItems});
        }
    });
    
  //  let day = date.getDate();

});

app.post('/', function(req, res) {
    const itemName = req.body.item;
    const listName = req.body.list; 

    const item = new Item({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/"); 
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }

});

app.post("/delete", function(req, res) {
    const checkItemId =  req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today")
    {
        Item.findByIdAndDelete(checkItemId, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Item deleted Successfully");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err, find) {
            if(!err) {
                res.redirect("/"+ listName);
            }

        });
    }
 
});

// app.get("/work", function(req, res) {
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if(!foundList) {
            // create new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();
            res.redirect("/"+ customListName);
        } else {
           // show existing list
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    });

    
});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
    console.log("Server has started successfully");
})
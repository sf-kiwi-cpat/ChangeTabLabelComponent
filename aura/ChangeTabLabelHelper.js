({
    // This is called once the call to get the current record information returns
    // We
    init : function(component, event) {
        //console.log("init Called. component.get('v.simpleRecord'):" + component.get('v.simpleRecord'));
        let foundFieldValue = false;
        let value = "";
        if('v.objectField'!=null) {
            //get the field name
            let field = component.get('v.objectField');
            //set key for values lookup
            let key = 'v.simpleRecord.'+field;
            //use the key to lookup value returned in LDS
            value = component.get(key);
            //console.log("key=" + key + " - value=" + value);
            if (value) 
            {
                foundFieldValue = true;
                // set the value to be used later 
                component.set('v.passThroughValue', value);
            }
        }
        
        let useContact = component.get('v.useContact');
        //console.log("useContact=" + useContact + " - foundFieldValue=" +foundFieldValue);
        if (!useContact && foundFieldValue)
        {
			//console.log("Setting label as object field value");
            component.set('v.tabLabel', value);
            this.setTabLabel(component);
       	}
        else
        {
            // Callout to the controller to get the contact information related to this record
            $A.enqueueAction(this.createGetNewLabelAction(component));
        }
     }
    ,
    createGetNewLabelAction : function(component)
    {
        let action = component.get("c.getNewLabel");
        action.setParams({ recordId: component.get("v.recordId")});
        action.setCallback(this,
               $A.getCallback(function(response1)
               {
                   let state = response1.getState();             
                   if (state === "SUCCESS")  
                   {
                       let useContact = component.get('v.useContact');
                       let value = response1.getReturnValue(); // This gets the answer from the Controller
                       if (value != null)
                       {
                           component.set('v.tabLabel', value);
                           this.setTabLabel(component);
                       }
                       else if (useContact && component.get('v.passThroughValue') != null)
                       {
                           // If we previously didn't set the tab based on the object field
                           // set it now the contact or account wasn't found.
                           component.set('v.tabLabel',component.get('v.passThroughValue'));
                           this.setTabLabel(component);
                       }
                   }
               }
           ));
        return action;
    },
    setTabLabel : function(component)
    {
        let label = component.get('v.tabLabel');
        if (label != null)
        {
            let workspaceAPI = component.find("workspace");
            workspaceAPI.getFocusedTabInfo().then(function(response) {
                let focusedTabId = response.tabId;
                // This sets the actual tab label with the result
                workspaceAPI.setTabLabel({
                    tabId: focusedTabId,
                    label: label
                });
            })
            .catch(function(error) {
                    console.log(error);
                });
        }
    }
})

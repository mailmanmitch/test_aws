import React from "../../../node_modules/react";
import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import 'reactjs-popup/dist/index.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import AddImagePopup from '../AddImagePopup/AddImagePopup';
const Sidebar = props => {
    const [isToggled, setIsToggled] = useState(false);
//onToggle={setIsToggled(!isToggled)} 

    const updateSidebar = () => {
        var sideBarState = !isToggled;
        setIsToggled(sideBarState);
    }
    const updatePopup = () => {
        updateSidebar();
        props.updatePopup();
    }
    return (
        <div>
            <button onClick={updateSidebar}>
                Toggle Sidebar
            </button>
        {   isToggled &&
            <ProSidebar 
            onToggle={updateSidebar}
            style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            float: "left",
            width: "20%",
            backgroundColor: "pink"}}>
            <Menu iconShape="square">
            <MenuItem onClick={updatePopup}>Add Image
            </MenuItem>
            <MenuItem>Delete Image</MenuItem>
            <MenuItem>      
                <AmplifySignOut />
            </MenuItem>
            </Menu>
            </ProSidebar>
        } 
          </div>
    )
}
export default Sidebar;
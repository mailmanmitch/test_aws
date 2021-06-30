import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes, getNote } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { Storage } from 'aws-amplify';
import Slider from "react-slick";
import cat from './assets/cat.jpeg';
import abs from './assets/abs.jpeg';
import Image from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import * as queries from './graphql/queries';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import AddImagePopup from './components/AddImagePopup/AddImagePopup';
const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isOpen, setIsOpen] = useState(false);

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    height: 500,
    adaptiveHeight: false,
    variableWidth: false,
    centerMode: true,
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);

  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  const toggleAddImagePopup = () => {
    setIsOpen(!isOpen);
  }

  /*

          <div  style={{height: 200, width: 200}}>
            <img src={cat} alt="cat"/>
          </div>
          <div  style={{height: 200, width: 200}}>
            <img src={abs} alt="abs"/>
          </div>

  */

  return (
    <div className="App">
      <ProSidebar onToggle style={{position: "absolute",
        top: 0,
        bottom: 0,
        float: "left",
        width: "20%",
        backgroundColor: "pink"}}>
        <Menu iconShape="square">
          <MenuItem onClick={toggleAddImagePopup}>Add Image
          </MenuItem>
          <MenuItem>Delete Image</MenuItem>
          <MenuItem>      
            <AmplifySignOut />
          </MenuItem>
        </Menu>
      </ProSidebar>
      <h1>My Pretty GF :)</h1>
      {isOpen && <AddImagePopup
              content={<>
                <b>Design your Popup</b>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                <button>Test button</button>
              </>}
              handleClose={toggleAddImagePopup}
            />}
      <div style={{display: "block",
                  float: "right",
                  width: "80%"}}>
        <Slider {...settings}>
          {
            notes.map(note =>
              (
                <div >
                  {note.image && <img src={note.image} style={{height: 500}} />}
                </div>
              ))
          }
        </Slider>
      </div>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
      type="file"
      onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>
      
    </div>
  );
}

/*
<div style={{marginBottom: 30}}>
      {
        notes.map(note => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            <button onClick={() => deleteNote(note)}>Delete note</button>
            {
              note.image && <img src={note.image} style={{width: 400}} />
            }
          </div>
        ))
      }
      </div>
      */
export default withAuthenticator(App);

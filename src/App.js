import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes, getNote } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { Storage } from 'aws-amplify';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./components/SideBar/Sidebar";
import Sidebar from './components/SideBar/Sidebar';
import AddImagePopup from './components/AddImagePopup/AddImagePopup';

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isOpen, setIsOpen] = useState(false);
  const [isPopupDisplayed, setIsPopupDisplayed] = useState(false);

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
  
  const toggelSideBar = () => {

  }
  const updatePopup = () => {
    var popupState = !isPopupDisplayed;
    setIsPopupDisplayed(popupState);
}
const createNewNote = () => {

}

  return (

    <div className="App">
    { isPopupDisplayed && 
      <AddImagePopup
        createNewNote={createNewNote}
        closePopup={updatePopup}>
      </AddImagePopup>
    }
      <h1>My Pretty GF :)</h1>
      <Sidebar updatePopup={updatePopup}></Sidebar>
      <div style={{display: "block",
                  float: "right",
                  width: "100%"}}>
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
      */
export default withAuthenticator(App);

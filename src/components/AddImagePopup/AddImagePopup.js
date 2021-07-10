import React, { useState, useEffect } from "../../../node_modules/react";
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../../graphql/mutations';
import { API,Storage } from "../../../node_modules/aws-amplify";

const AddImagePopup = props => {
    const initialFormState = { name: '', description: '' }
    const [formData, setFormData] = useState(initialFormState);
    const [notes, setNotes] = useState([]);

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
    
      async function onChange(e) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        setFormData({ ...formData, image: file.name });
        await Storage.put(file.name, file);
        //fetchNotes();
      }
      const closePopup = () => {
          props.closePopup();
      }

    return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon"
        onClick={closePopup}>x</span>
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
        {props.content}
      </div>
    </div>
    )
}
export default AddImagePopup;
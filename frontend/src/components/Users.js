import React, { useState } from 'react';
//import /* clonedeep */ from 'lodash./* clonedeep */';
import GenericCustomTable from './GenericCustomTable';

const initial_users_list = [{
    "id": "1",
    "first_name": "Shara",
    "last_name": "Weeds",
    "email": "sweeds0@barnesandnoble.com",
    "gender": "Female"
}, {
    "id": "2",
    "first_name": "Conant",
    "last_name": "Puddan",
    "email": "cpuddan1@ihg.com",
    "gender": "Male"
}, {
    "id": "3",
    "first_name": "Mehetabel",
    "last_name": "Mawtus",
    "email": "mmawtus2@sakura.ne.jp",
    "gender": "Female"
}
];

export default function Users() {

    const [users, setUsers] = useState(/* clonedeep */ JSON.parse(JSON.stringify(initial_users_list)));
    const [initialUsers, setInitialUsers] = useState(/* clonedeep */ JSON.parse(JSON.stringify(initial_users_list)));
    const [dataId, setDataId] = useState('');

    const emailRenderer = (data, fieldName) => {
        const fieldValue = data[fieldName];
        const url = `https://www.google.com?search=${fieldValue}`;
        return (
            <a href={url}>
                {fieldValue}
            </a>
        );
    };

    const editButtonClickHandler = (data) => {
        setDataId(data.id);
    };

    const cancelButtonClickHandler = () => {
        setDataId('');
        setUsers(/* clonedeep */ JSON.parse(JSON.stringify(initialUsers)));
    }

    const saveButtonClickHandler = (event)  => {
        const fieldAndId = event.target.id.split('-');
        if (dataId && dataId === fieldAndId[1]) {
            const updatedUser = users.find(user => user.id === dataId);
            // TODO: call backend service/api to save the data; POST request
            console.log(`USER SAVED ${JSON.stringify(updatedUser)}`);
            setDataId('');
            // below line just gives an impression that the data is saved
            setInitialUsers(/* clonedeep */ JSON.parse(JSON.stringify(users)));
        }
    }

    const editRenderer = (data, fieldName) => {
        if (dataId && dataId === data.id) {
            const saveButtonId = `save-${data.id}`;
            const cancelButtonId = `cancel-${data.id}`;
            return (
                <div>
                    <button
                        id={saveButtonId}
                        onClick={saveButtonClickHandler}
                    >
                        Save
                    </button>
                    <br></br>
                    <button
                        id={cancelButtonId}
                        onClick={cancelButtonClickHandler}
                    >
                        Cancel
                    </button>
                </div>
            );
        }
        return (
            <div>
                <button
                    onClick={() => editButtonClickHandler(data)}
                >
                    Edit
                </button>
            </div>
        );
    }

    const firstNameChangeHandler = (event) => {
        const fieldAndId = event.target.id.split('-');
        const fieldName = fieldAndId[0];
        const updatedUsers = /* clonedeep */JSON.parse(JSON.stringify(users));
        updatedUsers.forEach(user => {
            if (user.id === fieldAndId[1]) {
                user[fieldName] = event.target.value;
            }
        });
        setUsers(/* clonedeep */ JSON.parse(JSON.stringify(updatedUsers)));
    }

    const firstNameRenderer = (data, fieldName) => {
        if (dataId && dataId === data.id) {
            const inputId = `${fieldName}-${data.id}`;
            return (
                <div>
                    <input type="text"
                        id={inputId}
                        className="input-textbox"
                        value={data[fieldName]}
                        onChange={firstNameChangeHandler}
                    />
                </div>
            );
        }
        return (
            <div>
                <span>
                    {data[fieldName]}
                </span>
            </div>
        );
    }

    const getDisplayColumns = () => {
        return [
            {
                fieldName: 'id',
                displayText: 'ID',
                visible: false,
                columnSize: 1
            },
            {
                fieldName: 'first_name',
                displayText: 'First name',
                visible: true,
                columnSize: 2,
                renderer: firstNameRenderer
            },
            {
                fieldName: 'last_name',
                displayText: 'Last name',
                visible: true,
                columnSize: 2
            },
            {
                fieldName: 'email',
                displayText: 'Email',
                visible: true,
                columnSize: 4,
                renderer: emailRenderer
            },
            {
                fieldName: 'gender',
                displayText: 'Gender',
                visible: true,
                columnSize: 2,
            },
            {
                fieldName: 'action_buttons',
                displayText: 'Action',
                visible: true,
                columnSize: 2,
                renderer: editRenderer
            }
        ];
    };

    const displayColumns = getDisplayColumns();
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    Rendered Generic Custom Table
                </div>
            </div>
            <br />
            <div className="row">
                <GenericCustomTable
                    data={users}
                    columns={displayColumns}
                />
            </div>
            <br />
        </div>
    );

}

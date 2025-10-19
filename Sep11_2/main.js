LoadData();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
    try {
        const res = await fetch('http://localhost:3000/posts');
        if (!res.ok) throw new Error('Failed to fetch posts: ' + res.status);
        const posts = await res.json();
        const body = document.getElementById("body");
        const trash = document.getElementById("trash");
        // clear previous rows
        body.innerHTML = "";
        trash.innerHTML = "";
        for (const post of posts) {
            if (!post.isDelete) {
                body.innerHTML += convertDataToHTML(post);
            } else {
                trash.innerHTML += convertTrashToHTML(post);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    // ensure id passed as string to Delete
    result += "<td><input type='submit' value='Delete' onclick=\"Delete('" + post.id + "')\"></input></td>";
    result += "</tr>";
    return result;
}

function convertTrashToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='submit' value='Restore' onclick=\"Restore('" + post.id + "')\"></input></td>";
    result += "</tr>";
    return result;
}

async function getMaxID(){
    // NOTE: kept for backward-compatibility but not used when relying on server auto-id
    try {
        const res = await fetch('http://localhost:3000/posts');
        if (!res.ok) return 0;
        const posts = await res.json();
        const ids = posts
            .map(e => Number.parseInt(e.id))
            .filter(n => !Number.isNaN(n));
        if (ids.length === 0) return 0;
        return Math.max(...ids);
    } catch (err) {
        console.error(err);
        return 0;
    }
}



//POST: domain:port//posts + body
async function SaveData(){
    const idInput = (document.getElementById("id") ? document.getElementById("id").value.trim() : "");
    const title = document.getElementById("title").value;
    const view = document.getElementById("view").value;

    const dataObj = {
        title: title,
        views: view
    };

    try {
        if (idInput === "") {
            // create new and let server (json-server) assign id
            dataObj.isDelete = false;
            const res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                body: JSON.stringify(dataObj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log('Created:', res);
        } else {
            // update existing if exists; otherwise create with provided id
            const response = await fetch("http://localhost:3000/posts/" + idInput);
            if (response.ok) {
                const existing = await response.json();
                // preserve existing isDelete flag
                const payload = Object.assign({}, existing, {
                    title: dataObj.title,
                    views: dataObj.views
                });
                const res = await fetch('http://localhost:3000/posts/' + idInput, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                console.log('Updated:', res);
            } else {
                dataObj.id = idInput;
                dataObj.isDelete = false;
                const res = await fetch('http://localhost:3000/posts', {
                    method: 'POST',
                    body: JSON.stringify(dataObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                console.log('Created with provided id:', res);
            }
        }
    } catch (err) {
        console.error(err);
    }
    // refresh list after save
    LoadData();
}
//PUT: domain:port//posts/id + body

//DELETE: domain:port//posts/id
async function Delete(id){
    try {
        const res = await fetch('http://localhost:3000/posts/' + id);
        if (res.ok) {
            const obj = await res.json();
            obj.isDelete = true;
            const result = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log(result);
            // refresh list after delete
            LoadData();
        }
    } catch (err) {
        console.error(err);
    }
}

async function Restore(id){
    try {
        const res = await fetch('http://localhost:3000/posts/' + id);
        if (res.ok) {
            const obj = await res.json();
            obj.isDelete = false;
            const result = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log('Restored:', result);
            LoadData();
        }
    } catch (err) {
        console.error(err);
    }
}
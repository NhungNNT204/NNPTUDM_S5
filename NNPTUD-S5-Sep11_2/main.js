LoadData();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
    let data = await fetch('http://localhost:3000/posts');
    let posts = await data.json();
    for (const post of posts) {
        let body = document.getElementById("body");
        if(!post.isDelete){
            body.innerHTML += convertDataToHTML(post);
        }
        
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='submit' value='Delete' onclick='Delete("+post.id+")'></input></td>";
    result += "</tr>";
    return result;
}

async function getMaxID(){
    let res = await fetch('http://localhost:3000/posts');
    let posts = await res.json();
    //console.log(res);
    let ids = posts.map(
        function(e){
            return Number.parseInt(e.id);
        }
    )
    return Math.max(...ids);
}



LoadData();
// GET: domain:port//posts
// GET: domain:port/posts/id
async function LoadData() {
    try {
        const data = await fetch('http://localhost:3000/posts');
        const posts = await data.json();
        const body = document.getElementById("body");
        body.innerHTML = ""; // clear before render
        for (const post of posts) {
            if (!post.isDelete) {
                body.innerHTML += convertDataToHTML(post);
            }
        }
    } catch (err) {
        console.error('LoadData error', err);
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='button' value='Delete' onclick='Delete(" + post.id + ")'></input></td>";
    result += "</tr>";
    return result;
}

// return the maximum numeric id present in posts, or 0 when none
async function getMaxID() {
    try {
        const res = await fetch('http://localhost:3000/posts');
        const posts = await res.json();
        const ids = posts
            .map(e => Number.parseInt(e.id))
            .filter(n => !Number.isNaN(n));
        if (ids.length === 0) return 0;
        return Math.max(...ids);
    } catch (err) {
        console.error('getMaxID error', err);
        return 0;
    }
}


// POST: domain:port//posts + body
// If 'id' input is provided and exists -> update (PUT). If empty or not found -> create with auto-increment id.
async function SaveData() {
    try {
        const idInput = document.getElementById("id").value.trim();
        const title = document.getElementById("title").value;
        const view = document.getElementById("view").value;

        const dataObj = {
            title: title,
            views: view
        };

        if (idInput) {
            // try to update existing
            const response = await fetch(`http://localhost:3000/posts/${idInput}`);
            if (response.ok) {
                // keep existing fields and update
                const existing = await response.json();
                const updated = Object.assign({}, existing, dataObj);
                const res = await fetch(`http://localhost:3000/posts/${idInput}`, {
                    method: 'PUT',
                    body: JSON.stringify(updated),
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('Updated:', res);
                await LoadData();
                return;
            }
            // if not found fall through to create
        }

        // create new with auto-increment id
        const newId = (await getMaxID()) + 1;
        dataObj.id = String(newId);
        dataObj.isDelete = false;
        const res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            body: JSON.stringify(dataObj),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Created:', res);
        await LoadData();
    } catch (err) {
        console.error('SaveData error', err);
    }
}

// PUT a soft-delete by setting isDelete = true
// DELETE: domain:port//posts/id
async function Delete(id) {
    try {
        const res = await fetch(`http://localhost:3000/posts/${id}`);
        if (!res.ok) return;
        const obj = await res.json();
        if (obj.isDelete) return; // already deleted
        obj.isDelete = true;
        const result = await fetch(`http://localhost:3000/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(obj),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Soft-deleted:', result);
        await LoadData();
    } catch (err) {
        console.error('Delete error', err);
    }
}
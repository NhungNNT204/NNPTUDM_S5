// main.js đã chuyển sang async/await, ID tự tăng, xoá mềm (isDelete)

async function LoadData() {
    let data = await fetch('http://localhost:3000/posts');
    let posts = await data.json();
    let body = document.getElementById("body");
    body.innerHTML = "";
    for (const post of posts) {
        if (!post.isDelete) {
            body.innerHTML += convertDataToHTML(post);
        }
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='submit' value='Delete' onclick='Delete(" + post.id + ")'></input></td>";
    result += "</tr>";
    return result;
}

async function getMaxID() {
    let res = await fetch('http://localhost:3000/posts');
    let posts = await res.json();
    let ids = posts.map(e => Number.parseInt(e.id));
    return ids.length > 0 ? Math.max(...ids) : 0;
}

async function SaveData() {
    let title = document.getElementById("title").value;
    let view = document.getElementById("view").value;
    let id = document.getElementById("id").value;
    let dataObj = {
        title: title,
        views: view
    };
    if (id) {
        // Kiểm tra nếu id đã tồn tại thì update
        let response = await fetch("http://localhost:3000/posts/" + id);
        if (response.ok) {
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                body: JSON.stringify(dataObj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log(res);
            await LoadData();
            return;
        }
    }
    // Nếu không có id hoặc id không tồn tại thì tạo mới với id tự tăng
    dataObj.id = ((await getMaxID()) + 1).toString();
    dataObj.isDelete = false;
    let res = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        body: JSON.stringify(dataObj),
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log(res);
    await LoadData();
}

async function Delete(id) {
    let res = await fetch('http://localhost:3000/posts/' + id);
    if (res.ok) {
        let obj = await res.json();
        obj.isDelete = true;
        let result = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log(result);
        await LoadData();
    }
}

window.onload = LoadData;

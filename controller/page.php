<?php

get("/", function () {
    views("main");
});

get("/sub", function () {
    views("sub");
});
get("/course", function() {
    views('tour/course');
});
get("/schedule", function() {
    views('tour/schedule');
});
get("/event", function() {
    views("event");
});
post('/register', function () {
    extract($_POST);
    if (db::fetch("select * from users where id = '$id'")) {
        back("이미 존재하는 아이디입니다");
    } else {
        db::exec("insert into users(id, pw, name) values('$id', '$pw', '$name')");
        move("/", "회원가입 성공");
    }
});
post('/login', function() {
    extract($_POST);
    $user = db::fetch("select * from users where id = '$id'");
    if($user) {
        if($user->pw == $pw) {
            $_SESSION["ss"] =  $user;
            move('/', "로그인 성공");
        } else {
            back("비밀번호가 일치하지 않습니다");
        }
    } else {
        back("아이디가 일치하지 않습니다");
    }
});
get('/logout', function() {
    session_destroy();
    move("/", "로그아웃 성공");
});
post("/eventAdd", function() {
    extract($_POST);
    $file = $_FILES['photo'];
    db::exec("insert into tours(title, start_date, end_date, time, place, category, organization, photo) values('$title', '$start_date', '$end_date', '$time', '$place', '$category', '$organization', '$photo')");
    move("/event", "행사 등록 성공");
});
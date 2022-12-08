const getQueryParam = (name) => {
    if (window && window.location && window.location.search) {

        const urlSerachParams = new URLSearchParams(window.location.search);
        return urlSerachParams.get(name);
    }
}

const getProgramId = () => {
    return getQueryParam("program_id");
};

const getProgramAsync = async ({ programId }) => {
    const response = await fetch(`${baseUrl}/programs/${programId}/`);
    if (response.ok) {
        const program = await response.json();
        return program;
    }
    console.error("Invalid program id!");
};

const getChatroomAsync = async ({ chatroomId }) => {
    const response = await fetch(`${baseUrl}/chat-rooms/${chatroomId}/`);
    if (response.ok) {
        const chatRoom = await response.json();
        return chatRoom;
    }
    console.error("Invalid chat room id!");
};

const appendCss = ({ css }) => {
    document.head.appendChild(document.createElement("style")).innerHTML = css;
};

const getConfig = async ({ chatroomId }) => {
    var chatRoom = await getChatroomAsync({ chatroomId });
    return {
        style: {
            font: "../fonts/Alternate_Gothic_No3_D_Regular.otf",
            colors: {
                LoginPageBackground: "#183561",
                LoginPageInputFieldBackground: "#2f4971",
                LoginPageInputFieldBorder: "#183f6c",
                PageBackground: "#0c1324",
                WidgetBackground: "#1C2433",
                WidgetOptionBackground: "#272F3D",
                TextColor: "#fff",
                DisabledButton: "#c8c8c8",
                ButtonBackground: "#cf2e25",
                ButtonBackgroundDisabled: "#7e7e7e",
                CreateProfileButton: "#fff",
                CreateProfileButtonBackground: "#cf2e25",
                CorrectOptionBorder: "#00fa64",
                CorrectOptionProgressBackground: "#00fa64",
                CorrectOptionPercentage: "#00fa64",
                CorrectOptionDescription: "#00fa64",
                IncorrectOptionBorder: "#cf2e25",
                IncorrectOptionDescription: "#cf2e25",
                PredictionFollowUpFooterMessage: "#00fa64",
                SelectedOption: "#fff",
                TabInactive: "#1E2B4A",
                TabActive: "#1E2B4A",
                TabActiveLineColor: "#cf2e25",
                RequiredTextColor: "#808080"
            }
        },
        // TODO: add possibility to add custom css stylesheet
        css: []
    };

    if (!(chatRoom && chatRoom.custom_data)) {
        console.error("chatroom is not configured or missing custom_data");
    }
    console.log(JSON.parse(chatRoom.custom_data));
    return JSON.parse(chatRoom.custom_data);
};

const getRawFileContentAsync = async ({ path }) => {
    const response = await fetch(path, {
        headers: {
            "Content-Type": "text/plain"
        }
    });
    if (response.ok) {
        const content = await response.text();
        return content;
    }
    console.error(`Invalid file path!, cannot fetch ${path}`);
}

const loadStyleAsync = async ({ chatroomId, styles }) => {
    const config = await getConfig({ chatroomId });
    for (const stylePath of styles) {
        {
            getRawFileContentAsync({ path: stylePath }).then(css => {
                // replace font
                css = css.replaceAll(`__Font__`, config.style.font);

                // replace colors
                for (const key in config.style.colors) {
                    css = css.replaceAll(`"__${key}__"`, config.style.colors[key]);
                }

                appendCss({ css });
            });
        }
    }
};

const profileIsValid = () => {
    const value = localStorage.getItem('ProfileIsValid');
    if (value) {
        return true;
    }

    const nickname = document.querySelector('#form-user-nickname').value;
    const email = document.querySelector('#form-user-email').value;
    if (nickname && email) {
        return true;
    }

    return false;
};

const performUserFormValidation = () => {
    if (profileIsValid()) {
        document.querySelector('#createProfileButton').removeAttribute('disabled');
    } else {
        document
            .querySelector('#createProfileButton')
            .setAttribute('disabled', 'disabled');
    }
};

const showAllTabs = () => {
    document.querySelector('#timeline-nav-tab').style.display = 'block';
    document.querySelector('#leaderboard-nav-tab').style.display = 'block';
    document.getElementById('profile-nav-tab').style.display = 'none';
    document.querySelector('#widget-tab').click();
    const staticHeaderImage = document.getElementById("static-header-image");
    staticHeaderImage.setAttribute("src", "./images/small-header.jpg");
    staticHeaderImage.style.height = "120px";

};

const updateUserProfile = ({ nickname, custom_data }) => {
    LiveLike.updateUserProfile({
        accessToken: LiveLike.userProfile.access_token,
        options: {
            nickname: nickname,
            custom_data: JSON.stringify(custom_data),
        },
    })
        .then((res) => {
            localStorage.setItem('ProfileIsValid', true);
            refreshProfileData();
            showAllTabs();
            document.getElementById("player").style.display = "grid";
        })
        .catch((err) => {
            console.warn(err);
        });
};

const refreshProfileData = () => {
    document.querySelector('#form-user-nickname').value = "";//LiveLike.userProfile.nickname;
    var customData = JSON.parse(LiveLike.userProfile.custom_data);
    if (customData && customData.email) {
        document.querySelector('#form-user-email').value = customData.email;
    }
    performUserFormValidation();
};

const handleCreateUserProfile = (e) => {
    if (profileIsValid()) {
        updateUserProfile({
            nickname: document.querySelector('#form-user-nickname').value,
            custom_data: {
                email: document.querySelector('#form-user-email').value
            }
        });
    }
};

const showProfileTab = () => {
    document.querySelector('#timeline-nav-tab').style.display = 'none';
    document.querySelector('#leaderboard-nav-tab').style.display = 'none';
    document.getElementById('profile-tab-label').click();
    const staticHeaderImage = document.getElementById('static-header-image');
    staticHeaderImage.setAttribute("src", "./images/login-header.jpg");
    staticHeaderImage.style.height = "220px";
};

const showProfileTabIfFirstTimeVisiting = () => {
    performUserFormValidation();
    if (!profileIsValid()) {
        showProfileTab();
    } else {
        document.getElementById("player").style.display = "grid";
        document.getElementById('profile-nav-tab').style.display = 'none';
        document.getElementById('widget-tab').click();
    }
};
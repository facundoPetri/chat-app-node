const socket = io()

const $msgform = document.querySelector('form')
const $msgforminput = $msgform.querySelector('input')
const $msgformbutton = $msgform.querySelector('button')
const $locationbutton = document.querySelector('#location')
const $msgs = document.querySelector('#msgs')

const msgTemplate = document.querySelector('#msg-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
})

const autoscroll = () => {
    const $newMsg = $msgs.lastElementChild

    const newMsgStyles = getComputedStyle($newMsg)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMsg.offsetHeight + newMsgMargin

    const visibleHeight = $msgs.offsetHeight

    const containerHeight = $msgs.scrollHeight

    const scrollOffset = $msgs.scrollTop + visibleHeight

    if (containerHeight - newMsgHeight <= scrollOffset) {
        $msgs.scrollTop = $msgs.scrollHeight
    }
}

socket.on('message', msg => {
    console.log(msg)
    const html = Mustache.render(msgTemplate, {
        msg: msg.text,
        user: msg.user,
        createdAt: moment(msg.createdAt).format('H:mm'),
    })
    $msgs.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', ({ url, createdAt, user }) => {
    const html = Mustache.render(locationTemplate, {
        locationURL: url,
        user,
        createdAt: moment(createdAt).format('H:mm'),
    })
    $msgs.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    })
    document.querySelector('#sidebar').innerHTML = html
})

$msgform.addEventListener('submit', e => {
    e.preventDefault()

    $msgformbutton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', $msgforminput.value, () => {
        $msgformbutton.removeAttribute('disabled')
    })

    $msgforminput.value = ''
    $msgforminput.focus()
})

$locationbutton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('no geolocation')
    }

    $locationbutton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        socket.emit('sendLocation', { latitude, longitude }, () => {
            console.log('location shared')
            $locationbutton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

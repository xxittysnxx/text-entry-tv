# Two Hands, Two Touchpads: Optimizing Text Entry on Televisions

## Project Structure

The code for this project is split into 3 directories:

- `phone-client`: contains the logic for our mobile app which will detect touch input and send positional information to the server.
- `web-interface`: contains the keyboard interface and logic for mapping positional information onto the keyboard.
- `server`: contains logic for handling remote and web interface connections, and passes remote information to the web interface.

## Setup

To setup the project, run the following command in each of the 3 main directories (`phone-client`, `web-interface`, and `server`):

```
npm install
```

## Running

To run the project, first start the server, then start the web interface on the same device. The mobile remote will run on a mobile device after the server and web interface are running.

### Server and Web Interface

To run the server and web interface, execute the following command first in the `server` directory, then in the `web-interface` directory. Note, these should be executed in seperate terminals:

```
npm start
```

Once the react web interface is started, a tab should automatically open in your browser displaying the interface. If not, you can visit [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Mobile Remote

To run the mobile remote, you'll first need to install the __Expo Go__ app on your android device. You'll also need to make sure you are connected to the same local network* as the server and web interface. Then, on the same device as your server and web interface, you'll execute the following command to start the expo server:

```
npx expo start
```

Once the server is up and running, you should be able to scan the displayed QR code from within the __Expo Go__ app to view it on your mobile device.

*For some public networks that block internal communication, such as CometNet, you'll need to connect both your mobile device and server/web interface to the same private VPN. 
# Beyond Blitz automated quest

## How to use

- Go to [Beyond blitz dashboard](https://beyondblitz.app/dashboard)
- Open console using Ctrl + Shift + I
- Type 
``` allow pasting ```
- Get the refresh token using this code
```javascript
localStorage.getItem("BLITZ_REFRESH_TOKEN_KEY");
```
- Clone this repo
- Copy the token.txt.example into token.txt
- Provide the refresh token into token.txt (each new line equal to new identity)

### Current features

- [x] Twitter quest automation

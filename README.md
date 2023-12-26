
![Climine](https://socialify.git.ci/mvishok/climine/image?description=1&descriptionEditable=A%20lightweight%20scripting%20language%20for%20simplicity&font=Source%20Code%20Pro&forks=1&issues=1&language=1&logo=https%3A%2F%2Fi.postimg.cc%2FRFpgk3rb%2Fclimine.png&name=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Auto)

# Climine

Climine, a lightweight scripting language, prioritizes simplicity and customization. With a clear syntax for functions and input handling, it serves as an accessible tool for quick tasks and facilitates the understanding of fundamental scripting concepts.


## Example

```javascript
let age = input("Enter age:");

try{
    let age = num(age);
} handle {
    display(age & " is not a valid age");
    exit();
};

if (age>17){
    display("Eligible to vote");
} else {
    display("Ineligible to vote");
};

let count = 0;
until (age>17){
    let count = (count + 1);
    let age = (age + 1);
} else {
    display("Can vote in "&count&" years");
};

```


## Demo

Climine in action


![Screenshot](capture.png)

## Features

- Variables (with eval)
- Operators
- Function Definition
- Input Handling
- Conditional Statements
- Looping (while, until)
- Error Handling

## Installation

### Binary Executable (Windows)

 - Download the latest release of Climine from the [Releases](https://github.com/mvishok/climine/releases) page.

 - Extract the downloaded ZIP file to a location of your choice.

 - Open a command prompt in the extracted directory.

 - Run Climine using the following command:
   ```bash
   .\climine.exe script.cli
   ```
   
Replace script.cli with the name of your Climine script.
    
## Run from source

 - Clone the repository:

```bash
  git clone https://github.com/mvishok/climine.git
```

 - Navigate to the project directory:

```bash
  cd climine
```

 - Install dependencies
```bash
  npm install
```

 - Run Climine using the following command:

```bash
  npm start
```
  




## Support

For support, please use the [issues](issues) channel of this repository.


## License

[Apache 2.0](LICENSE)

## Author

👤 **Vishok Manikantan**

* Website: https://vishok.tech/
* Instagram: [@vishokmanikantan](https://instagram.com/vishokmanikantan)
* Github: [@mvishok](https://github.com/mvishok)
* LinkedIn: [@vishokmanikantan](https://linkedin.com/in/vishokmanikantan)

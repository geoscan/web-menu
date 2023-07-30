var Navbar = ReactBootstrap.Navbar,
Nav = ReactBootstrap.Nav,
Button = ReactBootstrap.Button,
Collapse = ReactBootstrap.Collapse,
Table = ReactBootstrap.Table,
Form = ReactBootstrap.Form,
ProgressBar = ReactBootstrap.ProgressBar,
ToggleButtonGroup = ReactBootstrap.ToggleButtonGroup,
ToggleButton = ReactBootstrap.ToggleButton;

var axios = axios

// var text_for_page = {
//     butterfly: "Butterfly Web Terminal - браузерная версия стандартного Linux терминала.",
//     code: "Code-Oss IDE - это современная среда разработки. С его помощью можно запускать ROS систему, писать программы, отлаживать код, взаимодействовать с Linux по средству встроенного терминала, просматривать файлы.",
//     bricks: "Pioneer Bricks – визуальная, блочная, браузерная среда разработки, обладающая всем функционалом современных IDE (создать файл, открыть файл, сохранить файл, консоль отладки). Данная среда прекрасно подойдет для детей, только начавших изучать программирование. Основной плюс данной среды – это простота использования, а так же моментальное исполнение программы.",
//     mission: "Mission Control - браузерный инструмент для подготовки Пионер Макс к АФС. С его помощью можно подключить Пионер Макс к QGroundControl."
// }

class RosTable extends React.Component {
    constructor(props) {
        super(props);
        this.socket = io(this.props.api)
        this.state = {
          status: -1,
          result: []
        };

        this.updateState = this.updateState.bind(this);
        this.socket.on("response", this.updateState);
        this.socket.emit("get");
    }

    componentWillUnmount()
    {
        this.socket.close();
    }

    updateState(data)
    {
        this.setState({status: data.status, result: data.result});
        // console.log(data);
        this.socket.emit("get");
    }

    render () {
        const { status, result } = this.state;

        var content_style = {
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth - 60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };
        
        if (status==0){    
            return (
                <div style={content_style}>
                    <h1 id="openh1">Список ROS {this.props.name}</h1>
                    <Table id="rostable" bordered >
                        <thead id="header">
                            <tr>
                            {this.props.header.map((column) => (
                                <th>{column}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row) => (
                                <tr>
                                    {
                                        row.map((content) => (
                                            <td>{content}</td>
                                        ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            );
        } else {
            return (
                <div style={content_style}>
                    <h1 id="openh1">ROS ядро не запущено</h1>
                </div>
            );
        }
    }
}

class RosManager extends React.Component {
    constructor(props) {
        super(props);

        this.socket = io("/status");
        this.state = {
          core: -1,
          launch: -1
        };
        this.roscoreClick = this.roscoreClick.bind(this);
        this.roslaunchClick = this.roslaunchClick.bind(this);
        this.updateState = this.updateState.bind(this);

        this.socket.on("response", this.updateState);
        this.socket.emit("get");
    }

    componentWillUnmount()
    {
        this.socket.close();
    }

    updateState(data)
    {
        this.setState({core: data.core, launch: data.launch});
        // console.log(data);
        this.socket.emit("get");
    }

    roscoreClick() {
        const { core, launch } = this.state;
        var requestOption = {};

        if (core == 1) {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 0})
            };
        }else{
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 1 })
            };
        }

        fetch("/core", requestOption);
    }

    roslaunchClick() {
        const { core, launch } = this.state;
        var requestOption = {};

        if (launch == 1) {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 0})
            };
        } else {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 1 })
            };
        }

        fetch("/launch", requestOption);
    }

    render() {
        const { core, launch } = this.state;
        var content_style = {
            display: "inline-grid",
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth -60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        var core_button = <Button></Button>;

        if (core == 1) {
            core_button = <Button id="roscore" variant="outline-danger" onClick={this.roscoreClick}>Выключить ядро ROS</Button>;
        }else{
            core_button = <Button id="roscore" variant="outline-success" onClick={this.roscoreClick}>Включить ядро ROS</Button>;
        }

        var launch_button = <Button></Button>;

        if (launch == 1) {
            launch_button = <Button id="roslaunch" variant="outline-danger" onClick={this.roslaunchClick}>Выключить ROS систему</Button>;
        } else {
            launch_button = <Button id="roslaunch" variant="outline-success" onClick={this.roslaunchClick}>Включить ROS систему</Button>;
        }

        return (
            <div style={content_style}>
                <h1 id="openh1">Управление ROS</h1>
                {core_button}
                {launch_button}
            </div>
        )
    }
}

class ApUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFile: null,
            progress : 0,
            upload: false
        };
        this.updateState = this.updateState.bind(this);
        this.socket = io('/progress');
    }

    componentWillUnmount()
    {
        this.socket.close();
    }

    onFileChange = event => this.setState({ selectedFile: event.target.files[0] });

    onFileUpload = () => {
        console.log(this.state.selectedFile);

        const formData = new FormData();
 
        formData.append(
            `${this.state.selectedFile.name}`,
            this.state.selectedFile,
            this.state.selectedFile.name
        );
        this.setState({ upload : true});
        axios.post("/update", formData);
        this.socket.on('response', this.updateState);
        this.socket.emit("get");
    }

    updateState(data)
    {
        this.setState({progress : data.progress})
        if (data.progress == 100)
        {
            this.socket.off('response');
            this.setState({upload : false});
            alert("Обновление завершено. Плата будет перезагружена");
        }
        else
        {
            this.socket.emit("get");
        }
    }

    render() {
        const { selectedFile, progress, upload } = this.state;
 
        var content_style = {
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth - 60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        if (!upload)
        {
            return (
                <div style={content_style}>
                    <h1 id="openh1">Обновление автопилота</h1>
                    <Form.Group controlId="formFile" className="mb-3" onChange={this.onFileChange}>
                        <Form.Control type="file" accept=".iboot"/>
                    </Form.Group>
    
                    <Button variant="outline-primary" id="upload" onClick={this.onFileUpload}>Прошить</Button>
                </div>
            );
        }
        else
        {
            return (
                <div style={content_style}>
                    <h1 id="openh1">Обновление автопилота</h1>
                    <ProgressBar animated now={progress} label={`${progress}%`}/>
                </div>
            )
        }
    }
}

class ParamTable extends React.Component {
    constructor(props) {
        super(props);
        // console.log(response);
        this.state = {
            result: [['', '']]
        };
        this.handleClick = this.handleClick.bind(this);
        this.onClickUpload = this.onClickUpload.bind(this);
        this.onClickSave = this.onClickSave.bind(this);
    }

    componentWillMount()
    {
        fetch("/params")
        .then(res => res.json())
        .then(
            (result) => {
            this.setState({
                result: result.params,
                selectedFile: null
            });
            }
        );
    }

    handleClick(e) {
        this.refs.fileUploader.click();
    }

    onClickUpload()
    {
        var requestOption = {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
               },
            body: JSON.stringify(this.state.result)
        };

        fetch("/params", requestOption);
        alert("Параметры обновлены. Плата будет перезагружена");
    }

    onClickSave()
    {
        const date = new Date().toJSON();
        var file = "# " + date.slice(0, 10) + " " + date.slice(11, 16) + "\r\n";
        this.state.result.forEach((param) => {
            if (Number.isInteger(param[1]))
            {
                file += param[0] + "=" + param[1] + ".0\r\n";
            }
            else
            {
                file += param[0] + "=" + param[1] + "\r\n";
            }
        })
        const blob = new Blob([file], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "pioneer.properties";
        link.href = url;
        link.click();
    }

    onFileChange = event => {
        var file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => { 
            const text = (e.target.result);
            const myArray = text.split('\r\n');
            var param_array = [];
            myArray.forEach((param) => {
                const param_value = param.split("=");
                if ((param_value[0][0] != "#") && (param_value[0] != ""))
                {
                    param_array.push([param_value[0], parseFloat(param_value[1])]);
                }
            });
            this.setState({result : param_array});
          };
        reader.readAsText(file);
    }

    onValueChange = event => {
        var result = this.state.result;
        result[event.target.id][1] = event.target.value;
    }


    render() {
        const { result, selectedFile } = this.state;

        var content_style = {
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth - 60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        var tableContent = [];
        for (let i = 0; i < result.length; i++)
        {
            tableContent.push(
                <tr>
                    <td>
                        {result[i][0]}
                    </td>
                    <td>
                        <Form.Control id={`${i}`} type="number" step="any" defaultValue={result[i][1]} onChange={this.onValueChange}/>
                    </td>
                </tr>
            );
        }
        return (
            <div style={content_style}>
                <h1 id="openh1">Параметры автопилота</h1>
                <div id="param_menu">
                    <Button variant="outline-primary" onClick={this.onClickUpload}>Обновить параметры</Button>
                    <Button variant="outline-primary" onClick={this.handleClick}>Открыть параметры</Button>
                    <Form.Group  style={{display: "none"}} controlId="formFile" className="mb-3">
                        <Form.Control ref="fileUploader" type="file" accept=".properties" onChange={this.onFileChange}/>
                    </Form.Group>
                    <Button variant="outline-primary" onClick={this.onClickSave}>Сохранить параметры</Button>
                </div>
                <Table id="rostable" bordered >
                    <thead id="header">
                        <tr>
                            <th>Название</th>
                            <th>Значение</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableContent}
                    </tbody>
                </Table>
            </div>
        )
    }
}

class ApControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            systems: [],
            current: 0
        }
        this.onClickRestart = this.onClickRestart.bind(this);
        // this.postNav = this.postNav.bind(this);
    }

    componentWillMount()
    {
        fetch("/navigation")
        .then(res => res.json())
        .then(
            (result) => {
            this.setState({
                systems: result.systems,
                current: result.current
            });
            }
        );
    }


    onChangeNav = event => {
        this.setState({current : event});
        var requestOption = {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
               },
            body: JSON.stringify({current : event})
        };

        fetch("/navigation", requestOption);
        alert("Система позиционирования установлена. Плата будет перезагружена");
    }

    onClickRestart()
    {
        var requestOption = {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
               }
        };
        fetch('/restart', requestOption);
        alert("Плата будет перезагружена");
    }

    render() {
        const { systems, current} = this.state;

        var content_style = {
            display: "inline-grid",
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth - 60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        return (
            <div style={content_style}>
                <h1 id="openh1">Управление автопилотом</h1>
                <ToggleButtonGroup type="radio" name="options" defaultValue={current} onChange={this.onChangeNav}>
                        <ToggleButton id="tbg-radio-1" value={0}>
                        {systems[0]}
                        </ToggleButton>
                        <ToggleButton id="tbg-radio-2" value={1}>
                        {systems[1]}
                        </ToggleButton>
                        <ToggleButton id="tbg-radio-3" value={2}>
                        {systems[2]}
                        </ToggleButton>
                </ToggleButtonGroup>
                <Button id="restart_button" variant="outline-primary" onClick={this.onClickRestart}>Перезагрузить автопилот</Button>
            </div>
        )
    }
}


class WebMenuNavItem extends React.Component{
    render() {
        return (
            <Nav.Item className={this.props.class}>
                <Nav.Link aria-controls={this.props.aria_controls} aria-expanded={this.props.aria_expanded} onClick={this.props.onclick}>{this.props.text}</Nav.Link>
            </Nav.Item>
        );
    }
}

class WebAppForm extends React.Component{
    render() {
        var content_style = {
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth}px`
        }

        var vars = document.getElementById("var")
        return (
            <div style={content_style}>
                <br></br>
                <form>
                    <h1 id="openh1">{this.props.name}</h1>
                    <h5 id="openh2">{this.props.text}</h5>
                    <Button id="open" variant="outline-success" href={`http://${vars.getAttribute("hostname")}:${vars.getAttribute(this.props.app)}`}>Открыть</Button>
                </form>
            </div>
        );
    }
}

class WebMenuNav extends React.Component {
    constructor(props, context) {
		super(props, context);

        this.myInput = React.createRef();
		this.state = {
            openAp: false,
            openRos: false
		};

        this.contentUpdate = this.contentUpdate.bind(this);
	}

    contentUpdate(content)
    {
        ReactDOM.unmountComponentAtNode(document.getElementById("content"));
        ReactDOM.render(content, document.getElementById("content"))
    }
    
    render() {
        const { openAp, openRos } = this.state;
        // var butterfly_button = "";
        // if (document.getElementById("var").getAttribute("butterfly") != -1) {
        //     butterfly_button = <WebMenuNavItem text="Web Terminal" onclick={() => ReactDOM.render(<WebAppForm name="Web Terminal" app="butterfly" text={text_for_page.butterfly} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        // }

        // var pioneer_bricks = "";
        // if (document.getElementById("var").getAttribute("bricks") != -1) {
        //     pioneer_bricks = <WebMenuNavItem text="Pioneer Bricks" onclick={() => ReactDOM.render(<WebAppForm name="Pioneer Bricks" app="bricks" text={text_for_page.bricks} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        // }

        // var code = "";
        // if (document.getElementById("var").getAttribute("code") != -1) {
        //     code = <WebMenuNavItem text="Code-Oss" onclick={() => ReactDOM.render(<WebAppForm name="Code-oss" app="code" text={text_for_page.code} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        // }

        // var mission = "";
        // if (document.getElementById("var").getAttribute("mission") != -1) {
        //     mission = <WebMenuNavItem text="Mission Control" onclick={() => ReactDOM.render(<WebAppForm name="Mission Control" app="mission" text={text_for_page.mission} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        // }

        return (
            <Navbar ref={this.myInput} id="mainnav" bg="light" className="scroll">
                <Navbar.Brand>
                    <img id="logo"
                        src="/static/img/logo.svg"
                        width="200"
                        height="50"
                    />
                </Navbar.Brand>
                <Nav id="menu">
                    {/* {butterfly_button}
                    {code}
                    {pioneer_bricks}
                    {mission} */}

                    <WebMenuNavItem
                        text="Автопилот"
                        onclick={() => this.setState({ openAp: !openAp })}
					    aria_controls="collapse-menu-autopilot"
					    aria_expanded={openAp}                 
                    />
                    <Collapse in={this.state.openAp}>
					    <div id="collapse-menu-autopilot">
                            <WebMenuNavItem text="Обновление автопилота" class="menu-item" onclick={() => this.contentUpdate(<ApUpdate nav_ref={this.myInput}/>)}/>
                            <WebMenuNavItem text="Параметры автопилота" class="menu-item" onclick={() => this.contentUpdate(<ParamTable nav_ref={this.myInput}/>)}/>
                            <WebMenuNavItem text="Управление автопилотом" class="menu-item" onclick={() => this.contentUpdate(<ApControl nav_ref={this.myInput}/>)}/>
                        </div>
				    </Collapse>
                    <WebMenuNavItem
                        text="ROS"
                        onclick={() => this.setState({ openRos: !openRos })}
					    aria_controls="collapse-menu-ros"
					    aria_expanded={openRos}                 
                    />
                    <Collapse in={this.state.openRos}>
					    <div id="collapse-menu-ros">
                            <WebMenuNavItem text="Управление ROS" class="menu-item" onclick={() => this.contentUpdate(<RosManager nav_ref={this.myInput}/>)}/>
                            <WebMenuNavItem text="Список узлов" class="menu-item" onclick={() => this.contentUpdate(<RosTable nav_ref={this.myInput} header={["Название"]} api="/node" name="Nodes"/>)}/>
                            <WebMenuNavItem text="Список сервисов" class="menu-item" onclick={() => this.contentUpdate(<RosTable nav_ref={this.myInput} header={["Название", "Тип", "Родительский узел"]} api="/service" name="Services"/>)}/>
                            <WebMenuNavItem text="Список тем" class="menu-item" onclick={() => this.contentUpdate(<RosTable nav_ref={this.myInput} header={["Название", "Тип", "Публикующий узел"]} api="/topic" name="Topics"/>)}/>
                        </div>
				    </Collapse>
                </Nav>
            </Navbar>
        )
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <WebMenuNav/>
                <div id="content"/>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
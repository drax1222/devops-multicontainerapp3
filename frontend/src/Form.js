
import React, { Component } from 'react'
import axios from 'axios';

class MyForm extends Component {
    constructor() {
      super();
  
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    state = {
        p1: "",
        p2: "",
        ServerResponse: "",
    }
    change = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
  
    handleSubmit = async (e) => {
        e.preventDefault();
        var response = await axios.get('/api/pointsdistance/'+this.state.p1+"/"+this.state.p2);
        console.dir(response);
        this.setState({
            ServerResponse: 'Odległość: ' + response.data.Distance + ' Źródło: ' + response.data.Source
        });
    }
  
    render() {  
      return (
        <div>
            <form>
                Punkt P1: <input id="p1" name="p1" type="text" placeholder="(x,y)" onChange={e=> this.change(e)}/> <br/>
                Punkt P2: <input id="p2" name="p2" placeholder="(x,y)" type="text" onChange={e=> this.change(e)}/><br/>
                <br/>
                <button onClick={e => this.handleSubmit(e)}>Oblicz</button>
            </form>
             <div class="response">
                {this.state.ServerResponse}
            </div>
        </div>
       );
    }
  }

export default MyForm
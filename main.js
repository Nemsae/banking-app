let App = React.createClass({
  getInitialState() {
    return {
      transactions: [],
      balance: 0,
      credits: 0,
      debits: 0,
      name: undefined,
      amount: undefined
    }
  },

  addTransaction(transaction) {
    let { transactions, balance, credits, debits } = this.state;
    balance = 0;
    credits = 0;
    debits = 0;

    transactions.push(transaction)

    transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        credits += (parseInt((transaction.amount))*-1);
      } else {
        debits += (parseInt(transaction.amount));
      }
    })

    this.setState({
      transactions,
      balance: parseInt(credits) + parseInt(debits),
      credits,
      debits,
    })

  },

  removeTransaction(id) {
    let { transactions, balance, debits, credits } = this.state;
    let newTransactions = transactions.filter(transaction => transaction.id !== id)
    balance = 0;
    credits = 0;
    debits = 0;

    newTransactions.forEach((transaction, i, transactions) => {
      if (transaction.type === 'credit') {
        credits += ((transaction.amount)*-1);
      } else {
        debits += transaction.amount;
      }
    })

    this.setState({
      transactions: newTransactions,
      balance: credits + debits,
      credits,
      debits,
    });
  },

  editTransaction(currID_parent, updatedTransaction_parent) {
    let { transactions, addTransaction, credits, debits, balance } = this.state;

    let updatedTransactions = transactions.map(transaction => {

      if (transaction.id === currID_parent) {
        return updatedTransaction_parent;
      } else {
        return transaction;
      }
    })

    credits = 0;
    debits = 0;
    balance = 0;

    updatedTransactions.forEach(transaction => {
      console.log('updatedTransactions: ',updatedTransactions)
      if (transaction.type === 'credit') {
        credits += ((parseInt(transaction.amount))*-1);
      } else {
        debits += parseInt(transaction.amount);
      }
    })

    this.setState({
      transactions:updatedTransactions,
      credits,
      debits,
      balance: parseInt(credits) + parseInt(debits),
    });

  },

  render() {
    console.log('this.state.balance: ', this.state.balance, '\nthis.state.transactions: ', this.state.transactions, '\nthis.state.credits: ', this.state.credits, '\nthis.state.debits: ',this.state.debits);
    let { transactions, edited, balance, credits, debits } = this.state;

    return (
      <div className="container">
        <h1>Banking App</h1>
        <TransactionForm addTransaction={this.addTransaction} edited={edited}/>
        <BalanceTable transactions={transactions} recalculateTransaction={this.recalculateTransaction} editTransaction={this.editTransaction} removeTransaction = {this.removeTransaction}/>
        <TotalsTable balance={balance} credits={credits} debits={debits}/>

      </div>
    )
  }
})

let TransactionForm = React.createClass({
  getInitialState() {
    return {
      type: '',
    }
  },

  addCardType(e){
    let newType = e.target.value;

    this.setState({
      type: newType,
    })
  },

  submitForm(e) {
    e.preventDefault();
    let { type } = this.state;
    let { name, amount, credit, debit } = this.refs;

    let transaction = {
      name: name.value,
      amount: parseFloat(amount.value),
      id: uuid(),
      type,
    };

    name.value = '';
    amount.value = null;
    type = '';

    this.props.addTransaction(transaction);

    this.setState({
      credit: credit.checked=false,
      debit: debit.checked=false,
    })
  },

  render() {
    return(
      <form onSubmit={this.submitForm}>
        <div className="form-group">
          <label htmlFor="newName">Transaction:</label>
          <input ref='name' type="text" className="form-control" id="newName" required/>
        </div>
        <div className="form-group">
          <label htmlFor="newPrice">Amount:</label>
          <input ref='amount' type="number" className="form-control" id="newAmount" min='0' step='.01'/>
        </div>
        <div className='radio active'>
          <label className="radio-inline" htmlFor="credit">
            <input onClick={this.addCardType} ref='credit' type="radio" id="Radios1" value="credit"/>Credit
            </label>
            <label className="radio-inline" htmlFor="debit">
              <input onClick={this.addCardType} ref='debit' type="radio" id="Radios2" value="debit"/>Debit
              </label>
            </div>
            <button onClick={this.submitForm} className="btn btn-default">Add</button>
          </form>
        )
      }
    })

let BalanceTable = React.createClass ({
  getInitialState() {
    return {
      updatedName: 0,
      updatedAmount: 0,
      currID: undefined,
      cardType: undefined,
    }
  },

  updateName(e) {
    let currName = e.target.value;

    this.setState({
      updatedName: currName,
    })
  },

  updateAmount(e) {
    let currAmount = e.target.value;

    this.setState({
      updatedAmount: currAmount,
    })
  },

  updateCardType(e) {
    let { cardType } = this.state;
    let currType = e.target.value;

    if (currType==='debit') {
      cardType = 'debit';
    } else {
      cardType = 'credit';
    }

    this.setState({
      cardType,
    })
  },

  grabID(id) {
    let { currID } = this.state;
    currID = id;

    this.setState({
      currID,
    })
  },

  submitEdit() {
    let { updatedAmount, updatedName, currID, cardType } = this.state;
    let { editTransaction, recalculateTransaction } = this.props;
    let { updateName, updateAmount, button1, button2 } = this.refs;

    let updatedTransaction = {
      name: updatedName,
      amount: updatedAmount,
      id: currID,
      type: cardType,
    }

    updateName.value = '';
    updateAmount.value = '';
    button1.checked = false;
    button2.checked = false;

    editTransaction(currID, updatedTransaction);
  },

  render() {
    let { transactions, removeTransaction, editTransaction, TransactionForm,  } = this.props;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Credit/Debit</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>

            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.name}</td>
                <td>{transaction.amount}</td>
                <td>
                    {transaction.type}
                </td>
                <td>
                  <button type="button" onClick={() => this.grabID(transaction.id)} className="btn btn-sm btn-default" data-toggle="modal" data-target="#myModal">Edit</button>
                </td>
                <td>
                  <button onClick={removeTransaction.bind(null, transaction.id)} className="btn btn-sm btn-danger">X</button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>


        <div className="modal fade" id="myModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title" id="myModalLabel">Edit Transaction</h4>
              </div>
              <div className="modal-body">

                <form>
                  <div className="form-group">
                    <label htmlFor="newName">Transaction:</label>
                    <input onChange={this.updateName} ref='updateName' type="text" className="form-control" id="updateName" required/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPrice">Amount:</label>
                    <input onChange={this.updateAmount} ref='updateAmount' type="number" className="form-control" id="updateAmount" min='0' step='.01'/>
                  </div>
                  <div>
                    <label className="radio-inline" htmlFor="credit">
                      <input onClick={this.updateCardType} ref='button1' type="radio" name="survey" id="Radios1" value="credit"/>Credit
                      </label>
                      <label className="radio-inline" htmlFor="debit">
                        <input onClick={this.updateCardType} ref='button2' type="radio" name="survey" id="Radios2" value="debit"/>Debit
                        </label>
                      </div>
                    </form>


                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button onClick= {this.submitEdit} type="button" className="btn btn-primary" data-dismiss="modal">Save changes</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )
      }
})

let TotalsTable = props => {
  let { balance, debits, credits } = props;

  return (
    <table className="table2">
      <thead>
        <tr>
          <th>Type:</th>
          <th>Total:</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Balance</td>
          <td>{balance}</td>
        </tr>
        <tr>
          <td>Debits</td>
          <td>{debits}</td>
        </tr>
        <tr>
          <td>Credits</td>
          <td>{credits}</td>
        </tr>
      </tbody>
    </table>
  )
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
)

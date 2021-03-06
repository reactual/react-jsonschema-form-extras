import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import tableConfFrom, { removePosition } from "./tableConfFactory";
import columnHeadersFrom from "./columnHeadersFactory";

function convertFields(cellValue, { type }) {
  if (type === "boolean") {
    return cellValue === "true";
  } else if (type === "number") {
    return parseFloat(cellValue);
  }
  return cellValue;
}

class TableField extends Component {
  constructor(props) {
    super(props);

    this.handleCellSave = this.handleCellSave.bind(this);
    this.handleRowsDelete = this.handleRowsDelete.bind(this);
  }

  handleCellSave(updRow, cellName, cellValue) {
    let { keyField, data } = this.tableConf;

    let fieldSchema = this.props.schema.items.properties[cellName];
    updRow[cellName] = convertFields(cellValue, fieldSchema);
    // Small hack to support object returned from async autocomplete
    // Don't judge me too hard
    if (cellValue[cellName]) {
      Object.assign(updRow, cellValue);
    }

    const targetKey = updRow[keyField];
    let updTable = data.map(
      row => (row[keyField] === targetKey ? updRow : row)
    );

    this.props.onChange(removePosition(updTable));
  }

  handleRowsDelete(removedKeys) {
    const { keyField, data } = this.tableConf;

    let filteredRows = data.filter(row => {
      let rowKey = row[keyField];
      return !removedKeys.includes(rowKey);
    });

    this.props.onChange(removePosition(filteredRows));
  }

  componentWillReceiveProps(nextProps) {
    let { uiSchema: { table: { focusOnAdd } } } = nextProps;
    this.adding =
      focusOnAdd !== undefined &&
      nextProps.formData &&
      this.props.formData &&
      nextProps.formData.length > this.props.formData.length;
  }

  componentDidUpdate() {
    if (this.adding) {
      let { uiSchema: { table: { focusOnAdd } } } = this.props;
      let { table: { refs: { body } } } = this.refs;
      body.handleEditCell(this.props.formData.length, focusOnAdd);
    }
  }

  render() {
    let {
      uiSchema,
      schema,
      formData,
      registry: { fields },
      onChange,
    } = this.props;

    this.tableConf = tableConfFrom(
      uiSchema,
      formData,
      this.handleCellSave,
      this.handleRowsDelete
    );

    this.tableConf.cellEdit.beforeSaveCell = this.beforeSaveCell;
    let columns = columnHeadersFrom(
      schema,
      uiSchema,
      fields,
      formData,
      onChange
    );

    return (
      <BootstrapTable {...this.tableConf} ref="table">
        {columns.map((column, i) => {
          return (
            <TableHeaderColumn key={i} {...column}>
              {column.displayName}
            </TableHeaderColumn>
          );
        })}
      </BootstrapTable>
    );
  }
}

export default TableField;

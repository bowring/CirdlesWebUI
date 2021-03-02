///////////////////////////////////////////////////////////////////////////////////////
// FIELDCARD.JS //////////////////////////////////////////////////////////////////////
// This component displays  a checkbox on the left of each fieldCard ////////////////
// Giving the user to decide if they want to use that fieldCard in the map or not //
///////////////////////////////////////////////////////////////////////////////////

import React from "react";
import "../../../styles/marsMapMaker.scss";
import classNames from "classnames";
import { connect } from "react-redux";
import CheckboxExample from "./CheckBox";
import DropDown from "./DropDown";
import FieldCardRender from "./renderCards/FieldCardRender";
import {
  removeContent,
  totalMultiValueCount,
  forceEdit,
  persistingDataConcat,
  greenFlip
} from "../../../actions/marsMapMaker";
import {
  isMetaDataAddCard,
  lengthCheckedValue,
  dateFormattedToSesar
} from "../util/helper";
import { MULTI_VALUE_TITLES as MVT } from "../util/constants";
const { options } = require("../util/sesarOptions");

export class FieldCard extends React.Component {
  state = {
    sesarChosen: "",
    dropDownChosen: false,
    areEditing: true,
    updatedValue: this.props.fieldValue,
    sesarOptions: options,
    formattedString: "",
    index: -1
  };

  // switch between CSS classes to switch between green and white
  btnClass = classNames({
    field_container3: this.props.addedNewField,
    field_container1: this.props.ent[this.props.id].isGreen,
    field_container2: !this.props.ent[this.props.id].isGreen
  });

  filterDrop = () => {
    return (
      <DropDown
        shouldAppear={this.props.ent[this.props.id].isGreen}
        refresh={this.refreshFieldCard}
        callback={this.fileCallback}
        title={this.props.fieldTitle}
        id={this.props.id}
        value={this.props.fieldValue}
        list={this.state.sesarOptions}
      />
    );
  };

  fileCallback = (data, title) => {
    let currentComponent = this;
    if (isMetaDataAddCard(this.props.id)) {
      let value;
      value = this.props.ent[this.props.id].value;

      currentComponent.setState({ updatedValue: value });
      return;
    }
    if (MVT.includes(title)) {
      //first two cases: if fieldcard sesarSelected is set to a multivalue
      // if non empty value for multivalue
      // else empty value

      if (data !== "") {
        currentComponent.setState({
          updatedValue: this.props.fieldTitle + ":" + data,
          dropDownChosen: true,
          formattedString: this.multiStringOutputFunction(this.props.id, title)
        });
      } else
        currentComponent.setState({
          updatedValue: this.props.fieldTitle + ":Not Provided",
          dropDownChosen: true,
          formattedString: this.multiStringOutputFunction(this.props.id, title)
        });
    } else if (this.props.fieldValue === "") {
      if (this.props.ent[this.props.id].value === "")
        currentComponent.setState({
          updatedValue: "Not Provided",
          dropDownChosen: true,
          index: -1
        });
    } else if (title === "first") {
      currentComponent.setState({
        updatedValue: data,
        dropDownChosen: true,
        index: -1
      });
    } else {
      if (
        this.props.ent[this.props.id].header === "<METADATA>" ||
        (this.props.ent[this.props.id].header.includes("<METADATA_ADD>") &&
          !this.props.ent[this.props.id].value.includes("<METADATA_ADD>"))
      ) {
        currentComponent.setState({
          updatedValue: data,
          dropDownChosen: true,
          index: -1
        });
      } else {
        currentComponent.setState({
          updatedValue: data,
          dropDownChosen: true,
          index: -1
        });
      }
    }
  };

  multiValuesBoolHelp = jsFileValue => {
    let valid = false;
    for (let i = 0; i < MVT.length; i++) {
      if (jsFileValue === MVT[i]) {
        valid = true;
      }
    }
    return valid;
  };

  jsFileValueToggle = () => {
    let valid = false;
    if (this.props.jsFileValues !== undefined) {
      for (let i = 0; i < this.props.jsFileValues.length; i++) {
        if (
          this.props.jsFileValues[i][1] === this.props.fieldTitle &&
          this.multiValuesBoolHelp(this.props.jsFileValues[i][0])
        )
          valid = true;
      }
    }
    return valid;
  };

  refreshFieldCard = () => {
    //rerenders fieldcard if wrong dropdown option is chosen
    setTimeout(() => {
      let obj = {
        oldValue: this.props.fieldCard,
        id: this.props.id,
        value: this.props.fieldValue,
        header: this.props.fieldTitle,
        isGreen: !this.props.ent[this.props.id].isGreen
      };

      this.setState({ sesarChosen: "", updatedValue: this.props.fieldValue });
      this.props.removeContent(obj);
      this.props.greenFlip(obj);
    }, 0);
  };

  entMultiSizeCount = (id, title) => {
    let index;
    let count;
    if (this.props.jsFileValues === undefined) count = 1;
    else count = 0;

    for (let i = 0; i < this.props.ent.length; i++) {
      if (this.props.ent[i].sesarTitle === title) {
        count += 1;
      }
    }
    for (let j = 0; j < MVT.length; j++) {
      if (MVT[j] === title) index = j;
    }

    const obj = {
      num: count,
      ftitle: title,
      findex: index
    };

    this.props.totalMultiValueCount(obj);

    return "Total: " + String(count);
  };

  findMultiValueSpot = (id, title) => {
    let searchOption = "";
    let count = 1;
    searchOption = title;

    for (let i = 0; i < this.props.ent.length; i++) {
      if (this.props.ent[i].sesarTitle === searchOption) count += 1;
    }
    return String(count);
  };

  multiStringOutputFunction = (id, title) => {
    this.entMultiSizeCount(id, title);
    let valid = false;
    let index;
    for (let j = 0; j < MVT.length; j++) {
      if (MVT[j] === title) {
        index = j;
        valid = true;
      }
    }

    if (valid === false) {
      this.setState({ index: -1 });
      this.forceUpdate();
    } else this.setState({ index: index });

    let formattedString = this.entMultiSizeCount(id, title);
    this.setState({ formattedString: formattedString });
    return formattedString;
  };

  isMultiValue = title => {
    let valid = false;
    for (let j = 0; j < MVT.length; j++) {
      if (MVT[j] === title) valid = true;
    }
    return valid;
  };

  areEditing = () => {
    this.setState({ areEditing: !this.state.areEditing });
  };

  forceEdit = event => {
    console.log(event);
    let obj = {};
    let persistentMetaData = {};
    if (event.key === "Enter" || typeof event.key === undefined) {
      persistentMetaData = {
        index: this.props.id,
        value: event.target.value,
        header: this.props.ent[this.props.id].header,
        forceID: this.props.persist.length,
        sesar: this.props.ent[this.props.id].sesarTitle,
        isMetaData: !(
          this.props.hasInit &&
          this.props.ent[this.props.id].header.includes("<METADATA_ADD>")
        ),
        isMetaDataAdd:
          this.props.hasInit &&
          this.props.ent[this.props.id].header.includes("<METADATA_ADD>")
      };

      if (event.key === "Enter") {
        persistentMetaData.value = event.target.value;
        this.setState({
          areEditing: !this.state.areEditing,
          updatedValue: event.target.value
        });
      } else {
        this.setState({
          updatedValue: event.target.value
        });
      }

      if (this.props.ent[this.props.id].header.includes("<METADATA_ADD>")) {
        obj = {
          index: this.props.id,
          value: event.target.value,
          header: "<METADATA_ADD>"
        };
      } else {
        obj = {
          index: this.props.id,
          value: event.target.value,
          header: "<METADATA>"
        };
      }

      let alreadySet = false;
      for (let i = 0; i < this.props.persist.length; i++) {
        if (
          this.props.persist[i].index === persistentMetaData.index &&
          this.props.ent[this.props.persist[i].index].sesarTitle ===
            this.props.persist[i].sesar
        ) {
          alreadySet = true;
          break;
        }
      }

      if (alreadySet) {
        console.log("Header already recorded");
      } else {
        this.props.persistingDataConcat(persistentMetaData);
      }

      this.props.forceEdit(obj);
    } else {
      this.setState({ updatedValue: event.target.value });
    }
  };

  editPlaceholderText = () => {
    let valueInStore = this.props.ent[this.props.id].value;
    let headerInStore = this.props.ent[this.props.id].header;
    let inputPlaceHolder = "Edit content...";

    if (
      (isMetaDataAddCard(this.props.id) &&
        (valueInStore !== "<METADATA_ADD>" &&
          valueInStore !== "ADDED_CARD : 1")) ||
      headerInStore === "<METADATA>"
    ) {
      inputPlaceHolder = valueInStore;
    }
    return inputPlaceHolder;
  };

  currentTotal = () => {
    for (let i = 0; i < this.props.totalMulti.length; i++) {
      if (
        this.props.hasInit &&
        this.props.totalMulti[i].title ===
          this.props.ent[this.props.id].sesarTitle
      ) {
        return "Total:" + this.props.totalMulti[i].count;
      }
    }
  };
  // function that creates an object with all the properties we need to render fieldCard
  createRenderingObject = () => {
    let obj = {
      id : this.props.id,
      fieldTitle : this.props.fieldTitle,
      fieldName : this.props.fieldName,
      fieldValue : this.props.fieldValue,
      greenCallback : this.greenToggle,
      isChecked : this.state.isGreen,
      areEditing : this.state.areEditing,
      updatedValue : this.state.updatedValue,
      forceEdit : this.forceEdit,
      editPlaceholderText : this.editPlaceholderText,
      filterDrop : this.filterDrop,
      hasInit : this.props.hasInit,
      ent : this.props.ent,
      isMultiValue : this.isMultiValue,
      areEditingFunction : this.areEditing,
      currentTotal: this.currentTotal,
      entMultiSizeCount: this.entMultiSizeCount,
      index: this.state.index
    };
    return obj;
  };

  render() {
    let propsToCard = this.createRenderingObject()
    //removes the unchecked field card
    if (this.props.hiding && this.props.ent[this.props.id].isGreen === false)
      return null;
    //returns the green styled field card
    else if (this.props.ent[this.props.id].isGreen) {
      //if a JS file was loaded and this card does not have a dropdown selected
      if (
        this.jsFileValueToggle() === true &&
        this.state.dropDownChosen === false
      ) {
        //and its header loaded in was METADATA **refactor to use isMetadata**
        if (
          this.props.hasInit &&
          this.props.ent[this.props.id].header === "<METADATA>"
        ) {
          return (
            <FieldCardRender cardType="fieldContainerMetaDataAdd" rObject={propsToCard} />
          );
        } else {
          {
            /*header was not metadata, create normal fieldcard **dropdown was not preselected from JS file***/
          }
          return (
<<<<<<< HEAD
            <FieldCardRender cardType="fieldContainer1" rObject={propsToCard} />
=======
            <div className="ui label">
              <div className="fieldContainer1">
                <object>
                  <div className="check__box">
                    <CheckboxExample id={this.props.id} />
                  </div>
                  <div dir="rtl" className="description__title">
                    {this.props.fieldTitle}
                  </div>
                  <div className="description__value">
                    {" "}
                    {":        " + lengthCheckedValue(this.props.fieldValue)}
                    {this.props.fieldValue.length > 25 ? (
                      <span className="hiddentext">
                        {this.props.fieldValue}
                      </span>
                    ) : null}
                  </div>
                </object>
                <object className="arrow">
                  <i className="fa fa-angle-double-right"></i>
                </object>
                <object className="descriptionMapped" align="right">
                  {/*right side of fieldcard*/}
                  {this.state.areEditing === true ? (
                    <div className="description__mapped__content">
                      {lengthCheckedValue(this.props.fieldValue)}
                      {this.props.fieldValue.length > 25 ? (
                        <span className="hiddentext">
                          {this.props.fieldValue}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "inline-block",
                        width: "150px",
                        paddingRight: "35px"
                      }}
                      class="ui input"
                    >
                      <input
                        value={this.state.updatedValue}
                        onChange={this.forceEdit}
                        onKeyPress={this.forceEdit}
                        style={{ display: "inline-block", width: "150px" }}
                        type="text"
                        placeholder={this.editPlaceholderText()}
                      />
                    </div>
                  )}
                  {this.props.ent[this.props.id].isGreen
                    ? this.filterDrop()
                    : null}

                  {/*If dropdown value is chosen, and value is not a multivalue display edit button */}
                  {this.props.hasInit === true &&
                  this.props.ent[this.props.id].sesarTitle !== "none" &&
                  this.props.ent[this.props.id].sesarTitle !== "" &&
                  this.isMultiValue(
                    this.props.ent[this.props.id].sesarTitle
                  ) === false ? (
                    <div class="pad">
                      <button
                        onClick={() => this.areEditing()}
                        class="ui icon button edit_icon"
                      >
                        <i class="fa fa-edit"></i>
                      </button>
                    </div>
                  ) : (
                    <div class="pad">
                      {this.props.hasInit && this.props.id !== -1
                        ? this.entMultiSizeCount(
                            this.props.id,
                            this.props.ent[this.props.id].sesarTitle
                          )
                        : null}
                    </div>
                  )}
                </object>
              </div>
            </div>
>>>>>>> fieldcard displays proper values on right now
          );
        }
      } else if (
        this.props.hasInit &&
        this.props.ent[this.props.id].sesarTitle !== "none" &&
        this.props.ent[this.props.id].header === "<METADATA>"
      ) {
        return (
          <FieldCardRender cardType="metaCard" rObject={propsToCard} />
        );
      } else {
        if (isMetaDataAddCard(this.props.id)) {
          return (
            <FieldCardRender cardType="metaCardAdd" rObject={propsToCard} />
          );
        } else {
          // this is the others two csv bug where edit icon doesn't show up
          return (
<<<<<<< HEAD
            <FieldCardRender cardType="editIcon" rObject={propsToCard} />
=======
            <div className="ui label">
              <div className="fieldContainer1">
                <object>
                  <div className="check__box">
                    <CheckboxExample id={this.props.id} />
                  </div>
                  <div dir="rtl" className="description__title">
                    {this.props.fieldTitle}
                  </div>
                  <div className="description__value">
                    {" "}
                    {":        " + lengthCheckedValue(this.props.fieldValue)}
                    {this.props.fieldValue.length > 25 ? (
                      <span className="hiddentext">
                        {this.props.fieldValue}
                      </span>
                    ) : null}
                  </div>
                </object>
                <object className="arrow">
                  <i className="fa fa-angle-double-right"></i>
                </object>
                <object className="descriptionMapped" align="right">
                  {this.state.areEditing === true ? (
                    <div className="description__mapped__content">
                      {!(
                        this.props.hasInit &&
                        this.props.ent[this.props.id].sesarTitle !== "" &&
                        this.props.ent[this.props.id].sesarTitle !== "none"
                      )
                        ? "Not Mapped"
                        : this.props.ent[this.props.id].sesarTitle ===
                            "collection_start_date" ||
                          this.props.ent[this.props.id].sesarTitle ===
                            "collection_end_date"
                        ? dateFormattedToSesar(
                            this.props.dateFormat,
                            this.props.fieldValue
                          )
                        : lengthCheckedValue(this.props.fieldValue)}
                      {this.state.updatedValue.length > 25 ? (
                        <span className="hiddentext">
                          {this.state.updatedValue}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "inline-block",
                        width: "150px",
                        paddingRight: "35px"
                      }}
                      class="ui input"
                    >
                      <input
                        value={this.props.fieldValue}
                        onKeyPress={this.forceEdit}
                        onChange={this.forceEdit}
                        style={{ display: "inline-block", width: "150px" }}
                        type="text"
                        placeholder="Edit Content..."
                      />
                    </div>
                  )}

                  {this.props.ent[this.props.id].isGreen
                    ? this.filterDrop()
                    : null}
                  {this.props.hasInit === true &&
                  this.props.ent[this.props.id].sesarTitle !== "none" &&
                  this.props.ent[this.props.id].sesarTitle !== "" &&
                  this.isMultiValue(
                    this.props.ent[this.props.id].sesarTitle
                  ) === false ? (
                    <div class="pad">
                      <button
                        onClick={() => this.areEditing()}
                        class="ui icon button edit_icon"
                      >
                        <i class="fa fa-edit"></i>
                      </button>
                    </div>
                  ) : (
                    <div class="hidden_pad">
                      <button class="ui icon button edit_icon">
                        <i class="fa fa-edit"></i>
                      </button>
                    </div>
                  )}

                  <div class="hidden_pad">
                    <div style={{ float: "right" }}>
                      {this.props.hasInit && this.state.index !== -1
                        ? this.currentTotal()
                        : ""}
                    </div>
                  </div>
                </object>
              </div>
            </div>
>>>>>>> UI updates with row changes
          );
        }
      }
    }

    // returns the white styled field card
    else {
      //need to set RenderFieldCard Component instead of this Robert Change
      return (
<<<<<<< HEAD
        <FieldCardRender cardType="white" rObject={propsToCard} />
=======
        <div className="ui label">
          <div className="fieldContainerDisabled">
            <object>
              <div className="check__box">
                <CheckboxExample
                  id={this.props.id}
                  isChecked={this.props.ent[this.props.id].isGreen}
                />
              </div>
              <div dir="rtl" className="description__title">
                {this.props.ent[this.props.id].header.includes("<METADATA_AD")
                  ? "Added Optional Metadata"
                  : this.props.fieldTitle}
              </div>
              <div className="description__value">
                {" "}
                {":        " + lengthCheckedValue(this.props.fieldValue)}
              </div>
            </object>
            <object className="descriptionMapped" align="right">
              <div className="description__mapped__content"> </div>
              <div
                style={{
                  paddingTop: "10px",
                  paddingLeft: "62px",
                  float: "right",
                  display: "inline"
                }}
              ></div>
              {this.props.ent[this.props.id].isGreen ? this.filterDrop() : null}
            </object>
          </div>
        </div>
>>>>>>> UI updates with row changes
      );
    }
  }
}

const mapStateToProps = state => {
  return {
    ent: state.marsMapMaker.entries,
    dateFormat: state.marsMapMaker.chosenDateFormat,
    century: state.marsMapMaker.century,
    persist: state.marsMapMaker.persistingMetaData,
    hasInit: state.marsMapMaker.hasInit,
    toggleIndex: state.marsMapMaker.toggleIndex,
    totalMulti: state.marsMapMaker.totalMultiCount,
    toggleArray: state.marsMapMaker.toggleArr
  };
};

export default connect(
  mapStateToProps,
  {
    forceEdit,
    removeContent,
    totalMultiValueCount,
    persistingDataConcat,
    greenFlip
  }
)(FieldCard);

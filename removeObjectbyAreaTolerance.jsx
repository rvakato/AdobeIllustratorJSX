function main() {
    if (app.documents.length === 0) {
        alert("No document is open. Please open a document and try again.");
        return;
    }

    var doc = app.activeDocument;

    // Create a panel to ask the user for the tolerance value
    var dialog = new Window("dialog", "Set Tolerance");
    dialog.orientation = "column";

    dialog.add("statictext", undefined, "Enter tolerance value (default: 14200):");
    var toleranceInput = dialog.add("edittext", undefined, "14200");
    toleranceInput.characters = 10; // Set the input field width
    toleranceInput.active = true;

    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";

    var cancelButton = buttonGroup.add("button", undefined, "Cancel", { name: "cancel" });
    var okButton = buttonGroup.add("button", undefined, "OK", { name: "ok" });

    var tolerance = null;

    // Button behavior
    cancelButton.onClick = function () {
        dialog.close();
    };

    okButton.onClick = function () {
        tolerance = parseFloat(toleranceInput.text);
        if (isNaN(tolerance) || tolerance <= 0) {
            alert("Please enter a valid positive number for the tolerance.");
        } else {
            dialog.close();
        }
    };

    dialog.show();

    // If the dialog was canceled, exit the script
    if (tolerance === null) {
        return;
    }

    // Step 1: Select all and Ungroup
    app.executeMenuCommand("selectall");
    app.executeMenuCommand("ungroup");

    // Step 2: Loop through all objects and check their area
    var removedCount = 0; // Counter for removed objects
    for (var i = doc.pageItems.length - 1; i >= 0; i--) {
        var item = doc.pageItems[i];

        // Check if the item has an area and compare it with the tolerance
        if (item.area && Math.abs(item.area) < tolerance) {
            item.remove();
            removedCount++;
        }
    }

    // Notify user of the result
    alert(removedCount + " objects with an area less than " + tolerance + " have been removed.");
}

// Run the main function
main();

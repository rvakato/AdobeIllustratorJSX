// Flyout Launcher for Scaling Artboard and Objects
function flyoutScaleArtboard() {
    // Create the dialog window
    var dialog = new Window("dialog", "Scale Artboard and Objects");

    // Add input field for scale percentage
    dialog.add("statictext", undefined, "Enter Scale Percentage (e.g., 50 for 50%):");
    var scaleInput = dialog.add("edittext", undefined, "50");
    scaleInput.characters = 10;

    // Add OK and Cancel buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");

    // Handle OK button click
    okButton.onClick = function () {
        var scaleValue = parseFloat(scaleInput.text);
        if (isNaN(scaleValue) || scaleValue <= 0) {
            alert("Please enter a valid positive number for the scale percentage.");
            return;
        }

        dialog.close();
        scaleArtboardAndObjects(scaleValue);
    };

    // Handle Cancel button click
    cancelButton.onClick = function () {
        dialog.close();
    };

    // Show the dialog
    dialog.show();
}

// Main function to scale the artboard and objects
function scaleArtboardAndObjects(scalePercentage) {
    var doc = app.activeDocument;

    if (!doc) {
        alert("No document is open. Please open a document first.");
        return;
    }

    // Get the current artboard
    var artboard = doc.artboards[0];
    var originalRect = artboard.artboardRect;

    // Calculate artboard width and height
    var artboardWidth = originalRect[2] - originalRect[0];
    var artboardHeight = originalRect[1] - originalRect[3];

    // Create a rectangle matching the artboard size
    var rect = doc.pathItems.rectangle(
        originalRect[1], // Top position
        originalRect[0], // Left position
        artboardWidth,   // Width
        artboardHeight   // Height
    );
    rect.filled = false; // No fill
    rect.stroked = false; // No stroke

    // Send rectangle to the back
    rect.zOrder(ZOrderMethod.SENDTOBACK);

    // Group the rectangle with all other objects
    var itemsToGroup = [];
    for (var i = 0; i < doc.pageItems.length; i++) {
        itemsToGroup.push(doc.pageItems[i]);
    }
    var group = doc.groupItems.add();
    for (var j = 0; j < itemsToGroup.length; j++) {
        itemsToGroup[j].moveToBeginning(group);
    }

    // Scale the group based on user input
    group.resize(
        scalePercentage, // Horizontal scaling
        scalePercentage, // Vertical scaling
        true, // Change positions
        true, // Change corners
        true, // Change line weights
        true, // Change patterns
        scalePercentage, // Horizontal scale factor
        Transformation.CENTER // Scale from center
    );

    // Adjust the artboard to fit the new size of the rectangle
    var newRect = group.pageItems[0].geometricBounds; // Get bounds of the rectangle
    artboard.artboardRect = [
        newRect[0], // Left
        newRect[1], // Top
        newRect[2], // Right
        newRect[3]  // Bottom
    ];

    // Ungroup all objects
    for (var k = doc.groupItems.length - 1; k >= 0; k--) {
        var groupItem = doc.groupItems[k];
        groupItem.ungroup();
    }

    // Delete the background rectangle
    var largestRectangle = null;
    var largestArea = 0;

    for (var l = 0; l < doc.pageItems.length; l++) {
        var item = doc.pageItems[l];
        if (item.typename === "PathItem" && !item.stroked && !item.filled) {
            var bounds = item.geometricBounds;
            var width = bounds[2] - bounds[0];
            var height = bounds[1] - bounds[3];
            var area = width * height;

            // Check if this is the largest rectangle
            if (area > largestArea) {
                largestArea = area;
                largestRectangle = item;
            }
        }
    }

    // If a rectangle was found, delete it
    if (largestRectangle) {
        largestRectangle.remove();
    } else {
        alert("No background rectangle found to delete.");
    }

    alert("Artboard and objects have been successfully scaled and cleaned up!");
}

// Run the launcher
flyoutScaleArtboard();

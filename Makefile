.PHONY: help subset-analyze subset-fonts subset-dry-run clean-subsets

# Default target
help:
	@echo "Code Phoropter - Font Management"
	@echo ""
	@echo "Available targets:"
	@echo "  subset-analyze    - Analyze code samples and extract unique glyphs"
	@echo "  subset-fonts      - Generate font subsets for preview mode (requires fonttools)"
	@echo "  subset-dry-run    - Show what would be subset without actually doing it"
	@echo "  clean-subsets     - Remove all generated .subset.* font files"
	@echo ""
	@echo "Dependencies for subsetting:"
	@echo "  pip install fonttools brotli"

# Analyze code samples to extract glyphs
subset-analyze:
	@echo "Analyzing code samples for unique glyphs..."
	python3 tools/analyze_glyphs.py
	@echo ""
	@echo "✓ Analysis complete. See tools/subset-glyphs.txt and tools/subset-glyphs.json"

# Generate font subsets
subset-fonts: subset-analyze
	@echo "Generating font subsets..."
	python3 tools/subset_fonts.py
	@echo ""
	@echo "✓ Subsetting complete. Subset files created with .subset extension"

# Dry run to see what would be subset
subset-dry-run: subset-analyze
	@echo "Dry run - showing what would be subset..."
	python3 tools/subset_fonts.py --dry-run

# Clean generated subsets
clean-subsets:
	@echo "Removing generated subset files..."
	find fonts -name "*.subset.*" -type f -delete 2>/dev/null || true
	@echo "✓ Subset files removed"

# Deploy to VPS (customize for your setup)
deploy-fonts:
	@echo "Deploying fonts to VPS..."
	@echo "Note: Customize this target for your rsync setup"
	@echo "Example:"
	@echo "  rsync -avz --progress fonts/ user@vps:/path/to/code-phoropter/fonts/"

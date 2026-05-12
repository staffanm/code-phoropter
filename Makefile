sync-fonts:
	rsync -rv --delete fonts/ staffan@phoropter.dev:/var/www/phoropter.dev/fonts/

node_modules: package.json
	npm install
	@touch node_modules

font-metrics.json: node_modules font-database.json fonts
	node extract-metrics.js metrics

embedded-fonts.css: node_modules font-database.json fonts
	node extract-metrics.js css

generate-fonts: font-metrics.json embedded-fonts.css

.PHONY: sync-fonts generate-fonts
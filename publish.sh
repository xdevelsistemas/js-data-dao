#!/bin/bash
echo "Publish";
echo "Package Version: ${TRAVIS_TAG}"
echo "Tag: ${TRAVIS_TAG}"
if [[ ${TRAVIS_TAG} == ${NPM_V} ]]
    then
        echo "Publishing package ${TRAVIS_TAG}";
        echo "//registry.npmjs.org/:_password=${NPM_PASSWORD}" > ~/.npmrc
        echo "//registry.npmjs.org/:_authToken=${NPM_AUTH}" >> ~/.npmrc
        echo "//registry.npmjs.org/:username=${NPM_USERNAME}" >> ~/.npmrc
        echo "//registry.npmjs.org/:email=${NPM_EMAIL}" >> ~/.npmrc
        npm publish ./
        echo "Success"
    else
        echo "Publishing package ${TRAVIS_TAG} failed"
        exit 1
fi
const myView = (props) => {
    return (
        <Page>
            <Section
                title={
                    <Text bold align="left">
                        Mindful Minutes Settings
                    </Text>
                }
            >
                <Toggle settingsKey="toggleVibrate" label="Vibrate every 5min" />
            </Section>
            <Select
                label={`Temperature Units`}
                settingsKey="temperatureUnits"
                options={[
                    { name: "Fahrenheit" },
                    { name: "Celsius" }
                ]}
            />
            <Section
                title={
                    <Text bold align="left">
                        Time Format
                    </Text>
                }
            >
                <Toggle settingsKey="tmformat" label="24h Time Format" />
            </Section>
        </Page >
    );
}

registerSettingsPage(myView);

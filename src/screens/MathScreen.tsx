import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useMathStore } from '../store/store';
import { Banknote, CreditCard, ShoppingCart, PiggyBank } from 'lucide-react-native';

// Strict typing for the store keys
type StoreField = 'paycheck' | 'sins' | 'willToLive' | 'escapeFund';

export default function MathScreen() {
  const store = useMathStore();
  const { maxPayment, principal, taxes, maintenance } = store.getCalculations();
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const [activeField, setActiveField] = useState<StoreField | null>(null);
  const [inputValue, setInputValue] = useState('');

  const openInput = (field: StoreField) => {
    setActiveField(field);
    setInputValue(store[field] === 0 ? '' : store[field].toString());
    bottomSheetModalRef.current?.present();
  };

  const handleSave = () => {
    if (activeField) store.setField(activeField, inputValue);
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  // Typed Grid Component
  const GridButton = ({ title, value, field, color, icon: Icon }: {
    title: string;
    value: number;
    field: StoreField;
    color: string;
    icon: any;
  }) => (
    <TouchableOpacity 
      style={[styles.gridButton, { borderLeftColor: color, borderLeftWidth: 4 }]} 
      onPress={() => openInput(field)}
      activeOpacity={0.8}
    >
      <Icon color={color} size={24} style={{ marginBottom: 8 }} />
      <Text style={styles.gridTitle}>{title}</Text>
      <Text style={styles.gridValue}>${value.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.outputSection}>
        <Text style={styles.headerText}>Your Absolute Ceiling</Text>
        <Text style={[styles.massiveNumber, maxPayment === 0 && { color: '#EF4444' }]}>
          ${maxPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}<Text style={styles.perMonth}>/mo</Text>
        </Text>
        
        <View style={styles.breakdownBox}>
          <Text style={styles.breakdownText}>P&I (The Bank): <Text style={{color: '#fff'}}>${principal.toFixed(0)}</Text></Text>
          <Text style={styles.breakdownText}>Taxes/Ins (The State): <Text style={{color: '#fff'}}>${taxes.toFixed(0)}</Text></Text>
          <Text style={styles.breakdownText}>Broken AC Fund: <Text style={{color: '#fff'}}>${maintenance.toFixed(0)}</Text></Text>
        </View>
      </View>

      <View style={styles.gridSection}>
        <View style={styles.gridRow}>
          <GridButton title="The Paycheck" value={store.paycheck} field="paycheck" color="#4ADE80" icon={Banknote} />
          <GridButton title="Past Sins (Debt)" value={store.sins} field="sins" color="#EF4444" icon={CreditCard} />
        </View>
        <View style={styles.gridRow}>
          <GridButton title="Will To Live" value={store.willToLive} field="willToLive" color="#FACC15" icon={ShoppingCart} />
          <GridButton title="Escape Fund" value={store.escapeFund} field="escapeFund" color="#60A5FA" icon={PiggyBank} />
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: '#1E1E1E' }}
        handleIndicatorStyle={{ backgroundColor: '#555' }}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetHeader}>Update Amount</Text>
          <TextInput
            style={styles.sheetInput}
            keyboardType="decimal-pad"
            autoFocus
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="0"
            placeholderTextColor="#555"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lock it in</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  outputSection: { flex: 1.2, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  headerText: { color: '#888', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  massiveNumber: { color: '#4ADE80', fontSize: 64, fontWeight: '900', marginVertical: 10 },
  perMonth: { fontSize: 24, color: '#555' },
  breakdownBox: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, width: '100%', marginTop: 20 },
  breakdownText: { color: '#888', fontSize: 14, marginBottom: 5, fontWeight: '600' },
  
  gridSection: { flex: 1, padding: 15, paddingBottom: 30, gap: 15 },
  gridRow: { flexDirection: 'row', gap: 15, flex: 1 },
  gridButton: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 16, padding: 15, justifyContent: 'center' },
  gridTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  gridValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 5 },

  sheetContent: { flex: 1, padding: 20, alignItems: 'center' },
  sheetHeader: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  sheetInput: { backgroundColor: '#121212', color: '#fff', width: '100%', fontSize: 40, fontWeight: '900', textAlign: 'center', padding: 20, borderRadius: 12, marginBottom: 20 },
  saveButton: { backgroundColor: '#fff', width: '100%', padding: 18, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#000', fontSize: 18, fontWeight: '900' },
});